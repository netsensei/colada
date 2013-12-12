desc 'nuke, build and compass'
task :generate do
  sh 'rm -rf www'
  jekyll
  sh 'cp -r assets www/assets'
end

def jekyll
  sh 'time jekyll build'
end
