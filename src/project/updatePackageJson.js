import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  try {
    const packageData = await fs.readJson(packageJsonPath);
    packageData.name = projectName;
    await fs.writeJson(packageJsonPath, packageData, { spaces: 2 });
    console.log(chalk.green('package.json updated successfully!'));
  } catch (error) {
    console.error(chalk.red(`Failed to update package.json: ${error}`));
  }
}

