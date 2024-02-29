# colada.be

> “The habit of writing for my eye is good practice. It loosens the ligaments.” -- Virigina Woolf

## Dispatches from my daily life

This is the repository for [colada.be](http://www.colada.be), my tech blog.

### Prerequisites

To setup this project locally, you will need to have these installed:

- [Ruby](https://www.ruby-lang.org/en/)
- [Jekyll](http://jekyllrb.com)

### Installation & setup

Pre-requisites:

Ruby 2.7.7. Install with `chruby` and `ruby-install`:

```
brew install chruby ruby-install xz
ruby-install ruby-2.7.7
source /opt/homebrew/opt/chruby/share/chruby/chruby.sh
source /opt/homebrew/opt/chruby/share/chruby/auto.sh
chruby ruby-2.7.7
```

Then:

1. Clone this repository.
2. Run `bundle install` from the root of the project to install dependencies.
3. Run `bundle exec jekyll serve` from the root of the project.
4. Point your browser to 127.0.0.1:4000 to see the website.