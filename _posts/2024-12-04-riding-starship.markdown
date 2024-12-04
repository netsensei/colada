---
layout: post
title:  "Riding Starship"
date:   2024-12-04
render_with_liquid: false
---
When it comes to shells and shell customization, I've been mostly using zsh with oh-my-zsh over the past decade. They come with so much convenience and nifty features and so I was quite content using them. Lately, one of my coworkers started using [starship.rs](https://starship.rs/). The blurb of this project reads:

> Starship cross-shell prompt
> The minimal, blazing-fast, and infinitely customizable prompt for any shell!

My co-worker seemed quite enthusiastic showing Starship's features, so I got curious, went ahead and switched to Starship.

## Disabling Oh My Zsh

For now, I don't want to wholesale remove Oh My Zsh, just disable it. This was easy. In my `~/.zshrc` file, I just had to comment these lines out:

```bash
# export ZSH="$HOME/.oh-my-zsh"
# source $ZSH/oh-my-zsh.sh
```

## Installing Starship

Again, it's as easy as using [Homebrew](https://brew.sh/) to get the job done:

```
brew install starship
```

Then adding this line to my `~/.zshrc`, et voila!

```
eval "$(starship init zsh)"
```

## Ping a nerd font

[Nerd fonts](https://www.nerdfonts.com/#home) is a collection of fonts specifically curated for developers working from the shell. These fonts are patched to include glyphs from popular icon fonts such as Font Awesome, Devicons and Octicons.

These fonts are available via Homebrew as well, so I let `brew` do the magic. I picked [Fira Code](https://www.programmingfonts.org/#firacode) just to get started, as it is recommened by the Starship people. 

```
brew install font-fira-code-nerd-font
```

I'm using [iTerm2](https://iterm2.com/), so I just popped into the preferences to set the font and I was good to go. Additionally, I had to add this line to my `.zshrc` file:

```
starship preset nerd-font-symbols -o ~/.config/starship.toml
```

## Configuring Starship

The `~/.config/starship.toml` file contains all the [configuration](https://starship.rs/config/). So far, I haven't quite figured out how that works. When I try edit the file and then execute `source ~/.zshrc`, my changes are replaced with the default configuration. For now, I'm okay with the defaults. This is something I need to figure out in the near future. I'll edit this article when I've done some more exploration.

## Configuring zsh

Finally, I've added some additional `.zshrc` configuration. Which reads like this:

```
# zsh history
setopt share_history
setopt hist_expire_dups_first
setopt hist_ignore_dups
setopt hist_verify
bindkey '^A' history-search-backward
bindkey '^B' history-search-forward
bindkey '^R' history-incremental-search-backward

# zsh autocomplete
autoload -Uz compinit
compinit

# zsh syntax highlighting
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# aliases

# git
alias gwc='git whatchanged -p --abbrev-commit --pretty=medium'
alias gst='git status -s -b'
alias gl='git lg'
alias gc='git commit'
alias gca='git commit -a'

# docker
alias da='docker container ls --all
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcdu='docker compose down && docker compose up -d'

# others
alias vi='nvim'
alias vim='nvim'
alias h='history 0'
alias del-ds-store='find . -name .DS_Store -type f -delete
```

The [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting) will, well, highlight syntax on zsh. It enables highlighting whenever you start typing commands, expressions, statements,... at the zsh prompt. Which is helpful for catching errors before executing a command. It's available via `brew` as well so:

```
brew install zsh-syntax-highlighting
```

Also, do note that I'm using [neovim](https://neovim.io/). I just alias the `vi` and `vim` commands to point towrads `nvim`. 

## Closing words

After 24 hours of usage, I've become charmed by Starship. I like the simplicity and the small thoughtful features like showing how long it took for a long-running command or program to complete in the prompt. I especially like how unobtrusive it is. There's very few in the way of bells and whistles unlike Oh My Zsh which basically takes over your `.zshrc` file. Overall, a great experience and a project I would recommend if you're open to prompt or shell customization.


