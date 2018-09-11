module.exports.handleError = err => {
  console.error(err);
  process.exit(1);
};

module.exports.delay = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

module.exports.BASE_URL = `https://std.eng.cu.edu.eg`;
module.exports.REG_URL = `/SIS/Modules/MetaLoader.aspx?path=~/SIS/Modules/Student/Registration/Registration.ascx`;
