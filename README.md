# S-VNF

Welcome to S-VNF!

## Overview

Sidecar VNF (S-VNF) is a deployable cross-cloud VNF coordinators for multi-domain VNF orchestration and management.

## Building S-VNF as OpenStack Image

This guide details building an OpenStack image containing the S-VNF for deployment purposes.

**Pre-requisites:**

* An OpenStack cloud environment

**Steps:**

1. **Create a Virtual Machine (VM):**

   - Launch a new VM in OpenStack using the Ubuntu Server 20.04 base image.

2. **Install S-VNF on the VM:**

   - Connect to the newly created VM via SSH.

   - Clone the S-VNF project repository:

     ```bash
     git clone git@github.com:Movsun/s-vnf.git
     ```

   - Install NodeJS using Node Version Manager (NVM):

     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
     # Copy and run the displayed command.
     nvm install --lts
     ```

   - Navigate to the project directory:

     ```bash
     cd s-vnf
     ```

   - Install project dependencies:

     ```bash
     npm install
     ```

   - Install PM2 for managing process lifecycle:

     ```bash
     npm install pm2 -g
     ```

3. **Build and Start the S-VNF service:**

   - Initialize Database: 

     ```bash
     npx prisma migrate reset
     ```

   - Build the project:

     ```bash
     npm run build
     ```

   - Start the service using PM2:

     ```bash
     pm2 start dist/main.js
     ```
   
   - Configure PM2 to start the service automatically on system boot:
   
     ```bash
     pm2 startup systemd
     ```
   - Copy and run the displayed command to enable the service on startup.
     ```bash
     #sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.12.0/bin /home/ubuntu/.nvm/versions/node/v20.12.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
     ```
   - Save the current PM2 configuration:
   
     ```bash
     pm2 save
     ```

**Next Steps:**

* After this process, create a snapshot of the VM. This snapshot can then be used as the S-VNF image for deployment.

## To deploy the S-VNF

### OpenStack VIM Prerequisite for Enabling Cross-Cluster VNF Communication

**To facilitate connections between VNFs across different clusters, we'll be assigning OpenStack Floating IPs to them. This involves configuring OSM to allocate Floating IPs during VNF deployment.**

**Steps:**

1. **Add OpenStack VIM with Floating IP Configuration:**

   - Execute the following command, carefully replacing placeholders with your actual values:

     ```bash
     osm vim-create --name <vim-name> --user admin --password <VIM-password> --auth_url <VIM-URL> --tenant <Tenant-name> --account_type openstack --config='{use_floating_ip: "<Floating_IP_UUID>"}'
     ```

     - `<vim-name>`: Desired name for the VIM within OSM.
     - `<VIM-password>`: Password for accessing the OpenStack VIM.
     - `<VIM-URL>`: Authentication URL for your OpenStack VIM.
     - `<Tenant-name>`: Name of the tenant within the OpenStack VIM.
     - `<Floating_IP_UUID>`: UUID of the specific Floating IP network you want to associate with VNFs.
2. **Ensure that OSM has access to the network where the S-VNF is deployed.**

**Key Points:**

- This configuration ensures OSM assigns a Floating IP from the specified network to each VNF during its creation.

**Additional Information:**

* https://osm.etsi.org/docs/user-guide/latest/04-vim-setup.html
* https://docs.openstack.org/project-deploy-guide/charm-deployment-guide/train/config-openstack.html

***Adding S-VNF Package to OSM**

- Copied the examples VNFD into OSM
  
- Extract, and modify Image Name in S-VNFD YAML File to change S-VNF image name, External Network Name, etc. 

- Upload VNF and NS Package via command line via OSM-CLI or OSM WEB UI to upload: Use the `osm vnfpkg-create` command to upload the VNF package from your local system to the OSM catalog.

```
osm vnfpkg-create examples/s-vnf-vnf.tar.gz
```

```
osm nspkg-create examples/s-vnf-ns.tar.gz
```
### MANO Configuration for S-VNF

There are two primary methods for setting MANO credential in S-VNF:

1. Pre-deployment Configuration (VNFD YAML):

    Include the MANO configuration directly within the S-VNF Descriptor YAML file.

2. Post-deployment Configuration (VNF Primitive Function):

    Configure MANO after S-VNF deployment using the VNF primitive function in the OSM UI.

### S-VNF Network Join

Similar to MANO configuration, you can define the S-VNF network join either with VNFD or by exeucting the VNF primitive.

## To deploy the example of a Web Server with Load Balancer using S-VNF.
1. Upload the WebServer and LoadBalancer from the examples directories into OSM.
2. Access the deployed S-VNF UI by navigating to <s-vnf-ip>:8000/home 
3. Click on "Create Deployment" and choose the NS for deployment.