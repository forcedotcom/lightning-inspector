export default async function (tabURL) {
  const url = tabURL.split('/');
  const releaseVersionUrl = `${url[0]}//${url[2]}/sfdc/releaseVersion.jsp`;

  try {
    const res = await fetch(releaseVersionUrl);
    const text = await res.text();

    const releaseVersion = {
      environment: tabURL.split('/')[2],
      changeList: text.match(/CoreChangeList=Change (\d+) .*/g)[0].match(/\d+/)[0],
      releaseName: text.match(/ReleaseName=\d+.*/g)[0].match(/\d+[.\d]+/)[0],
      auraVersion: text.match(/AuraJarVersion=.*/g)[0].match(/\d+.\d+/)[0]
    };

    releaseVersion.asString = `${releaseVersion.environment}: ${releaseVersion.releaseName} / CL: ${releaseVersion.changeList} / Aura: ${releaseVersion.auraVersion}`;

    return releaseVersion;
  } catch (e) {

  }
}