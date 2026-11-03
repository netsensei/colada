# colada.be

> “The habit of writing for my eye is good practice. It loosens the ligaments.” -- Virigina Woolf

## Dispatches from my daily life

This is the repository for [colada.be](http://www.colada.be), my tech blog.

### Setup

Built with [Hugo](https://gohugo.io) (extended), pinned in the `Makefile`.
`make tools` downloads it into `.tools/`; nothing gets installed system-wide.

- `make serve`: run the site locally at http://localhost:1313.
- `make build`: build the site into `public/`.

### Deploying

`make deploy` builds the site and rsyncs `public/` to the server as
`deploy-colada`. It needs the `hetzner` WireGuard tunnel and the
`~/.ssh/id_deploy_colada_be` key. The GitHub Action only builds.