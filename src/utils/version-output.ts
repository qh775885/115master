import {name, version} from '../../package.json';

const versionOutput = () => {
  console.log(`version: ${name}@${version}`);
};

export default versionOutput;
