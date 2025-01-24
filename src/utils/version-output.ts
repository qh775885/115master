import pkg from '../../package.json';

const versionOutput = () => {
  console.log(`version: ${pkg.name}@${pkg.version}`);
};

export default versionOutput;
