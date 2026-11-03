# Pinned to the same version as .github/workflows/build.yml
HUGO_VERSION := 0.161.1

TOOLS := .tools
HUGO  := $(TOOLS)/hugo

DEPLOY_KEY  := ~/.ssh/id_deploy_colada_be
DEPLOY_HOST := deploy-colada@10.10.0.1

.PHONY: tools build deploy serve

tools: $(HUGO)

# Start from an empty public/, so stale files never get deployed.
# Permissions (directories 755, files 644) are set here because macOS's
# openrsync has no --chmod; rsync -p carries them over to the server.
build: tools
	rm -rf public
	$(HUGO) --source .
	chmod -R u=rwX,go=rX public

# Needs the hetzner WireGuard tunnel. The key only allows write-only rsync
# into /var/www/colada.be, hence the empty target path.
deploy: build
	rsync -rlptz --delete -e "ssh -i $(DEPLOY_KEY)" public/ $(DEPLOY_HOST):

serve: tools
	$(HUGO) server --source .

# Hugo only ships a .pkg for macOS; unpack the binary without installing it.
$(HUGO):
	mkdir -p $(TOOLS)
	rm -rf $(TOOLS)/hugo.pkg $(TOOLS)/hugo-pkg
	curl -fL -o $(TOOLS)/hugo.pkg "https://github.com/gohugoio/hugo/releases/download/v$(HUGO_VERSION)/hugo_extended_$(HUGO_VERSION)_darwin-universal.pkg"
	pkgutil --expand-full $(TOOLS)/hugo.pkg $(TOOLS)/hugo-pkg
	mv $(TOOLS)/hugo-pkg/Payload/hugo $(HUGO)
	rm -rf $(TOOLS)/hugo.pkg $(TOOLS)/hugo-pkg
