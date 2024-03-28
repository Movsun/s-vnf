import { Injectable, UnauthorizedException } from "@nestjs/common";
// import { CreateDomainDto } from './dto/create-domain.dto';
// import { UpdateDomainDto } from './dto/update-domain.dto';
import { PrismaService } from "src/prisma.server";
import { Domain, Prisma } from "@prisma/client";
import { catchError, firstValueFrom, map } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class DomainsService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  async domain(
    domainWhereUniqueInput: Prisma.DomainWhereUniqueInput
  ): Promise<Domain | null> {
    return this.prisma.domain.findUnique({
      where: domainWhereUniqueInput,
    });
  }

  async domains(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DomainWhereUniqueInput;
    where?: Prisma.DomainWhereInput;
    orderBy?: Prisma.DomainOrderByWithRelationInput;
  }): Promise<Domain[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.domain.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createDomain(data: Prisma.DomainCreateInput): Promise<Domain> {
    return this.prisma.domain.upsert({
      where: { name: data["name"] },
      update: { url: data["url"] },
      create: data,
    });
  }

  async updateDomain(params: {
    where: Prisma.DomainWhereUniqueInput;
    data: Prisma.DomainUpdateInput;
  }): Promise<Domain> {
    const { where, data } = params;
    return this.prisma.domain.update({
      data,
      where,
    });
  }

  async deleteDomain(where: Prisma.DomainWhereUniqueInput): Promise<Domain> {
    return this.prisma.domain.delete({
      where,
    });
  }

  async findByName(name: string) {
    return this.prisma.domain.findUnique({
      where: {
        name: name,
      },
    });
  }

  async getNsdAndVim(id: number) {
    const domain = await this.domain({ id: id });
    if (domain) {
      return firstValueFrom(
        this.httpService
          .get(domain["url"] + "/mano/nsd-and-vim", {
            headers: { "Content-Type": "application/json; charset=utf-8" },
          })
          .pipe(map((res) => res.data))
          .pipe(
            catchError((e) => {
              console.error(e);
              throw new UnauthorizedException();
            })
          )
      );
    }
    return {};
  }

  async setSeflDomain(data: Prisma.DomainCreateInput): Promise<Domain> {
    const domain = await this.prisma.domain.deleteMany({
      where: { is_self: true },
    });
    return this.prisma.domain.create({
      data: {
        name: data["name"],
        url: data["url"],
        is_self: true,
      },
    });
  }

  async getSelfDomain(): Promise<Domain> {
    return this.prisma.domain.findFirst({
      where: { is_self: true },
    });
  }

  async sendJoinRequest(body) {
    // body: {name, url} of domain to be sent too.
    await this.createDomain(body);
    const selfdomain = await this.getSelfDomain();
    firstValueFrom(
      this.httpService.post(
        body["url"] + "/domains/join",
        {
          name: selfdomain["name"],
          url: selfdomain["url"],
        },
        {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      )
    ).then(async (res) => {
      for (let d of res.data) {
        await this.createDomain({ name: d["name"], url: d["url"] });
        await firstValueFrom(
          this.httpService.post(
            d["url"] + "/domains/join",
            {
              name: selfdomain["name"],
              url: selfdomain["url"],
            },
            {
              headers: { "Content-Type": "application/json; charset=utf-8" },
            }
          )
        );
      }
    });
    return "done";
  }
}
