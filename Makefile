# Pinned to the same version as .github/workflows/build.yml
HUGO_VERSION := 0.161.1

TOOLS := .tools
HUGO  := $(TOOLS)/hugo

DEPLOY_KEY  := ~/.ssh/id_deploy_colada_be
DEPLOY_HOST := deploy-colada@10.10.0.1

.PHONY: tools build deploy serve check-rsync

tools: $(HUGO)

# Start from an empty public/, so stale files never get deployed.
build: tools
	rm -rf public
	$(HUGO) --source .

# macOS's own rsync is openrsync, which rejects or silently ignores --chmod.
check-rsync:
	@rsync --version | grep -qE '^rsync +version [3-9]' || { echo "Needs rsync 3 or newer: brew install rsync"; exit 1; }

# Needs the hetzner WireGuard tunnel. The key only allows write-only rsync
# into /var/www/colada.be, hence the empty target path. IdentitiesOnly stops
# ssh from offering the agent's other keys first, which trips MaxAuthTries.
# Directories 755 and files 644 on the server, whatever they are locally.
deploy: check-rsync build
	rsync -rlptz --delete --chmod=D755,F644 -e "ssh -i $(DEPLOY_KEY) -o IdentitiesOnly=yes" public/ $(DEPLOY_HOST):

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
