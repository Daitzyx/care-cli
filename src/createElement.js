import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createElement(type, name, directory = 'src/components') {
    const elementDir = path.join(directory, name);
    const indexPath = path.join(elementDir, `${name}.tsx`);
    const stylesPath = path.join(elementDir, 'styles.ts');

    // Conteúdos diferenciados por tipo
    const indexContent = `import React from 'react';
import { Container } from './${name}.styles';

export function ${name}() {
    return (
        <Container>
            {/* Implementation of ${type} */}
        </Container>
    );
}
`;

    const stylesContent = `import styled from 'styled-components';

export const Container = styled.div\`\`;
`;

    try {
        await fs.ensureDir(elementDir);
        await Promise.all([
            fs.writeFile(indexPath, indexContent),
            fs.writeFile(stylesPath, stylesContent)
        ]);
        console.log(chalk.green(`${type.charAt(0).toUpperCase() + type.slice(1)} ${name} created successfully at ${elementDir}`));
    } catch (error) {
        console.error(chalk.red(`Failed to create ${type} ${name}: ${error.message}`));
    }
}
