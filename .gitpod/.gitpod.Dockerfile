FROM gitpod/workspace-node

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=UTC
ENV SHELL=/bin/bash

## https://www.gitpod.io/docs/config-docker
USER gitpod

# ######################################################################################################################
# Install browsers
#   https://github.com/webdriverio/webdriverio/blob/36d8c142c6efd3323199819b86e185acc5a5a800/.gitpod/dev.dockerfile

RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg \
 && sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/ \
 && sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list' \
 && sudo rm microsoft.gpg \
 && sudo apt-get update \
 && sudo apt-get install -y \
        chromium-browser \
        firefox \
        microsoft-edge-dev

# ######################################################################################################################
# Install Playwright
#
# Playwright has a peculiar installation procedure, where it fails silently if you try to install it on GitPod
# as it assumes it's being installed in "dev mode".
#   https://github.com/microsoft/playwright/blob/35a9daa4255f2ba556d4d7af6243cc84d1ac4f2a/packages/playwright/install.js#L19-L24
#
# Instead, I need to use the same trick Playwright themselves use, which is to install Playwright using a temporary Npm project
#   https://github.com/microsoft/playwright/blob/35a9daa4255f2ba556d4d7af6243cc84d1ac4f2a/utils/docker/Dockerfile.focal
#
# The path to directory cache must be "/ms-playwright" because of the hard-coded path in Playwright:
#   https://github.com/microsoft/playwright/blob/35a9daa4255f2ba556d4d7af6243cc84d1ac4f2a/packages/playwright-core/src/server/registry/dependencies.ts#L31
#   https://playwright.dev/docs/ci#caching-browsers

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ARG DOCKER_IMAGE_NAME_TEMPLATE="mcr.microsoft.com/playwright:v%version%-focal"

RUN sudo bash -c "mkdir -p ${PLAYWRIGHT_BROWSERS_PATH} \
        && mkdir -p ${PLAYWRIGHT_BROWSERS_PATH}/agent \
        && chmod -R 777 ${PLAYWRIGHT_BROWSERS_PATH} \
        && rm -rf /var/lib/apt/lists/*" \
 && bash -c "cd ${PLAYWRIGHT_BROWSERS_PATH}/agent \
        && npm init -y && npm i playwright@latest \
        && npx playwright@latest mark-docker-image "${DOCKER_IMAGE_NAME_TEMPLATE}" \
        && npx --yes playwright@latest install --with-deps" \
 && sudo bash -c "chmod -R 777 ${PLAYWRIGHT_BROWSERS_PATH} \
        && rm -rf ${PLAYWRIGHT_BROWSERS_PATH}/agent"

# ######################################################################################################################
# Install HTTP Server

RUN bash -c "npm i -g http-server"

# ######################################################################################################################
# Install Java
#   https://github.com/gitpod-io/workspace-images/blob/e91b47d148d6687703e258a7589b8cba74367a88/chunks/lang-java/Dockerfile

RUN curl -fsSL "https://get.sdkman.io" | bash \
 && bash -c ". /home/gitpod/.sdkman/bin/sdkman-init.sh \
        && sed -i 's/sdkman_selfupdate_enable=true/sdkman_selfupdate_enable=false/g' /home/gitpod/.sdkman/etc/config \
        && sed -i 's/sdkman_selfupdate_feature=true/sdkman_selfupdate_feature=false/g' /home/gitpod/.sdkman/etc/config \
        && sdk install java \
        && sdk flush archives \
        && sdk flush temp \
        && echo 'export SDKMAN_DIR=\"/home/gitpod/.sdkman\"' >> /home/gitpod/.bashrc.d/99-java \
        && echo '[[ -s \"/home/gitpod/.sdkman/bin/sdkman-init.sh\" ]] && source \"/home/gitpod/.sdkman/bin/sdkman-init.sh\"' >> /home/gitpod/.bashrc.d/99-java"
# above, we are adding the sdkman init to .bashrc (executing sdkman-init.sh does that), because one is executed on interactive shells, the other for non-interactive shells (e.g. plugin-host)

# ###################################################################################################################### \
# Download Cucumber extension for VSCode - https://github.com/cucumber/vscode

RUN sudo bash -c "mkdir -p /vscode-extensions \
    && curl -Ls $(curl -Ls https://api.github.com/repos/cucumber/vscode/releases/latest | jq -c '.assets[] | select(.name | test("^cucumber-official.*.vsix$")) | .browser_download_url') -o /vscode-extensions/cucumber-official.vsix \
    && chmod -R 777 /vscode-extensions"
