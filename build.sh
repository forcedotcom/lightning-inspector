
# Lets get ESLint going at a later date
# eslint src/ || exit

echo "RUN FROM ROOT LIGHTNING INSPECTOR DIRECTORY ./build.sh"

# Find the location of Chrome for building the ctx file
if [[ "$OSTYPE" = "darwin"* ]]; then
  chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
else
  chrome="googlechrome"
fi

cwd=`pwd`
filename=`basename $cwd`
builddir=$cwd/builds
ctx=$builddir/lightning-inspector.ctx
staging=$builddir/lightning-inspector

echo "Variables Set"

# remove any left of crx or pem files, suppress/ignore output by redirecting to /dev/null
#rm *.crx *.pem > /dev/null 2>&1

echo "Copied all files to staging, time to pack crx file"

# Not a big deal right now
#"$chrome" --pack-extension=$staging #--pack-extension-key=$builddir/lightning-inspector.pem

#chrome will create an extension with the directory name, renaming to our project name
#mv $root/lightning-inspector.crx $builddir/$filename.crx
#mv $root/lightning-inspector.pem $builddir/$filename.pem

#create the zip
rm $builddir/$filename.zip > /dev/null 2>&1
cd $staging/
zip -r $builddir/$filename.zip *
cd $cwd 
 
# revert the change to manifest, packing the extension will fail without the key present in the manifest
#git checkout $root/manifest.json
