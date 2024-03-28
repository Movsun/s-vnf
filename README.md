# S-VNF

Welcome to S-VNF!

## Overview

Sidecar VNF (S-VNF) is a deployable cross-cloud VNF coordinators for multi-domain VNF orchestration and management.

## Getting Started (Work in Progress)

To start S-VNF on local development, follow these instructions:

1. Clone the repository.
2. Install dependencies.
3. Initialize the Database.
4. Run the application.

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
     # Copy and run the displayed command to enable the service on startup.
     ```
   
   - Save the current PM2 configuration:
   
     ```bash
     pm2 save
     ```

**Next Steps:**

* After this process, create a snapshot of the VM. This snapshot can then be used as the S-VNF image for deployment.

## To deploy the provided example VNFD with S-VNF (Work in Progress)