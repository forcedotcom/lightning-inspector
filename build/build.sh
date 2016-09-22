
# Lets get ESLint going at a later date
# eslint src/ || exit

echo "RUN FROM BUILD DIRECTORY ./build.sh"

if [[ "$OSTYPE" = "darwin"* ]]; then
  chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
else
  chrome="googlechrome"
fi

# remove any left of crx or pem files, suppress/ignore output by redirecting to /dev/null
rm *.crx *.pem > /dev/null 2>&1

cwd=`pwd`
root=`dirname $cwd`
filename=`basename $root`
builddir=$root/build

"$chrome" --pack-extension=$root/aura-devtools/aura-inspector #--pack-extension-key=$builddir/aura-devtools/aura-inspector.pem

#chrome will create an extension with the directory name, renaming to our project name
mv $root/aura-devtools/aura-inspector.crx $builddir/$filename.crx
mv $root/aura-devtools/aura-inspector.pem $builddir/$filename.pem

# strip out the key and comments from the manifest before bundling
if [[ "$OSTYPE" = "darwin"* ]]; then
    sed -i '' 's/\"key\".*//; s#[ \t]//.*##' $root/aura-devtools/aura-inspector/manifest.json
else
    sed -i 's/\"key\".*//; s#[ \t]//.*##' $root/aura-devtools/aura-inspector/manifest.json
fi

#create the zip
rm $builddir/$filename.zip > /dev/null 2>&1
cd $root/aura-devtools/aura-inspector
zip -r $builddir/$filename.zip *
#cd $root 
 
# revert the change to manifest, packing the extension will fail without the key present in the manifest
git checkout $root/aura-devtools/aura-inspector/manifest.json
