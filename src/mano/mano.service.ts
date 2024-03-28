import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateManoDto } from "./dto/create-mano.dto";
import { UpdateManoDto } from "./dto/update-mano.dto";
import { PrismaService } from "src/prisma.server";
import { OSMToken } from "src/utils/OSMToken";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom, map } from "rxjs";
import { CreateDeployNSDto } from "./dto/create-deploy-ns.dto";
// import fetch from "node-fetch"

@Injectable()
export class ManoService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  async getCredential() {
    return this.prisma.manoCredential.findFirst();
  }

  async updateCredential(data) {
    const firstCred = await this.prisma.manoCredential.findFirst();
    if (firstCred) {
      return this.prisma.manoCredential.update({
        where: { id: firstCred.id },
        data: data,
      });
    } else {
      return this.prisma.manoCredential.create({ data: data });
    }
  }

  async deployNs(data: CreateDeployNSDto) {
    const cred = await this.getCredential();
    const token = await this.getOSMToken();
    return firstValueFrom(
      this.httpService
        .post(cred["url"] + "/osm/nslcm/v1/ns_instances_content", data, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        })
        .pipe(map((res) => res.data["id"]))
        .pipe(
          catchError((e) => {
            console.error(e);
            throw new UnauthorizedException();
          })
        )
    );
  }

  private async getOSMToken() {
    if (OSMToken.token && OSMToken.expires > Date.now()) {
      return OSMToken.token;
    }
    return this.getTokenFromOSM();
  }

  private async getTokenFromOSM() {
    const cred = await this.getCredential();
    if (cred) {
      return firstValueFrom(
        this.httpService
          .post(
            cred["url"] + "/osm/admin/v1/tokens",
            { username: cred["username"], password: cred["password"] },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                Accept: "application/json",
              },
            }
          )
          .pipe(
            map((res) => {
              OSMToken.token = res.data["_id"];
              OSMToken.expires = Math.floor(res.data["expires"] * 1000);
              return res.data.id;
            })
          )
          .pipe(
            catchError((e) => {
              console.error(e);
              throw new UnauthorizedException();
            })
          )
      );
    }
    throw new UnauthorizedException();
  }

  async getNsDetail(nsId: string) {
    const cred = await this.getCredential();
    const token = await this.getOSMToken();
    return this.httpService
      .get(cred["url"] + "/osm/nslcm/v1/ns_instances_content/" + nsId, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e) => {
          console.error(e);
          throw new UnauthorizedException();
        })
      );
  }

  async getNsOperationalState(nsId: string) {
    return (await this.getNsDetail(nsId)).pipe(
      map((res) => res["operational-status"])
    );
  }

  async getNsVduCount(nsId: string) {
    return (await this.getNsDetail(nsId)).pipe(
      map((res) => res["_admin"]["deployed"]["VCA"].length)
    );
  }

  // actionData should also include vdu_count_index
  async runNsAction(nsId, actionData) {
    const cred = await this.getCredential();
    const token = await this.getOSMToken();
    return firstValueFrom(
      this.httpService
        .post(
          cred["url"] + "/osm/nslcm/v1/ns_instances/" + nsId + "/action",
          actionData,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              Authorization: "Bearer " + token,
            },
          }
        )
        .pipe(map((res) => res.data["id"]))
        .pipe(
          catchError((e) => {
            console.error(e);
            throw new UnauthorizedException();
          })
        )
    );
  }

  async getActionDetail(actionId) {
    const cred = await this.getCredential();
    const token = await this.getOSMToken();
    return this.httpService
      .get(cred["url"] + "/osm/nslcm/v1/ns_lcm_op_occs/" + actionId, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e) => {
          console.error(e);
          throw new UnauthorizedException();
        })
      );
  }

  async getOperationStatus(actionId) {
    return (await this.getActionDetail(actionId)).pipe(
      map((res) => res["operationState"])
    );
  }

  async deleteNs(nsId: string) {
    const cred = await this.getCredential();
    const token = await this.getOSMToken();
    return this.httpService
      .delete(cred["url"] + "/osm/nslcm/v1/ns_instances_content/" + nsId, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e) => {
          console.error(e);
          throw new UnauthorizedException();
        })
      );
  }

  async getAllNsdAndVim() {
    const cred = await this.getCredential();
    const token = await this.getOSMToken();
    const nsd = await firstValueFrom(
      this.httpService
        .get(cred["url"] + "/osm/nsd/v1/ns_descriptors_content", {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        })
        .pipe(map((res) => res.data))
        .pipe(
          catchError((e) => {
            console.error(e);
            throw new UnauthorizedException();
          })
        )
    );
    const vim = await firstValueFrom(
      this.httpService
        .get(cred["url"] + "/osm/admin/v1/vim_accounts", {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        })
        .pipe(map((res) => res.data))
        .pipe(
          catchError((e) => {
            console.error(e);
            throw new UnauthorizedException();
          })
        )
    );
    return {
      nsd: nsd,
      vim: vim
    }
  }

  // create(createManoDto: CreateManoDto) {
  //   return 'This action adds a new mano';
  // }

  // findAll() {
  //   return `This action returns all mano`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} mano`;
  // }

  // update(id: number, updateManoDto: UpdateManoDto) {
  //   return `This action updates a #${id} mano`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} mano`;
  // }
}
