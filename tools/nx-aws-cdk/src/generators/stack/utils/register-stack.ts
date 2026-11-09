import {
  applyChangesToString,
  ChangeType,
  joinPathFragments,
  logger,
  type StringChange,
  type Tree,
} from '@nx/devkit';
import * as ts from 'typescript';

/**
 * Imports the stack into `src/app-stage.ts` and instantiates it at the end of
 * the stage's constructor. Falls back to printing the code to add when the
 * file doesn't look like the one the cdk-app generator creates.
 */
export function registerStack(
  tree: Tree,
  projectRoot: string,
  className: string,
  fileName: string,
) {
  const stagePath = joinPathFragments(projectRoot, 'src', 'app-stage.ts');
  const stackClass = `${className}Stack`;
  const importStatement = `import { ${stackClass} } from './stacks/${fileName}/${fileName}-stack';`;

  const warn = (reason: string, propsName = 'props') =>
    logger.warn(
      [
        `Could not add ${stackClass} to ${stagePath}: ${reason}`,
        'Add it to your stage yourself:',
        `  ${importStatement}`,
        `  new ${stackClass}(this, '${className}', { config: ${propsName}.config });`,
      ].join('\n'),
    );

  if (!tree.exists(stagePath)) return warn('the file does not exist.');

  const source = tree.read(stagePath, 'utf-8') ?? '';
  const sourceFile = ts.createSourceFile(
    stagePath,
    source,
    ts.ScriptTarget.Latest,
    true,
  );

  const stageClass = sourceFile.statements
    .filter(ts.isClassDeclaration)
    .find((node) =>
      node.heritageClauses?.some((clause) =>
        clause.types.some((type) =>
          /(^|\.)Stage$/.test(type.expression.getText(sourceFile)),
        ),
      ),
    );
  const constructor = stageClass?.members
    .filter(ts.isConstructorDeclaration)
    .find((member) => member.body);
  if (!constructor?.body) {
    return warn('no class extending cdk.Stage with a constructor was found.');
  }

  const propsParam = constructor.parameters[2]?.name;
  if (!propsParam || !ts.isIdentifier(propsParam)) {
    return warn('the stage constructor has no `props` parameter.');
  }
  const propsName = propsParam.text;

  if (source.includes(`new ${stackClass}(`)) {
    return warn(`${stackClass} is already instantiated.`, propsName);
  }

  const imports = sourceFile.statements.filter(ts.isImportDeclaration);
  const lastImport = imports[imports.length - 1];
  const statements = constructor.body.statements;
  const lastStatement = statements[statements.length - 1];

  const changes: StringChange[] = [
    {
      type: ChangeType.Insert,
      index: lastImport ? lastImport.getEnd() : 0,
      text: lastImport ? `\n${importStatement}` : `${importStatement}\n\n`,
    },
    {
      type: ChangeType.Insert,
      index: lastStatement
        ? lastStatement.getEnd()
        : constructor.body.getStart(sourceFile) + 1,
      text: `\n\n    new ${stackClass}(this, '${className}', { config: ${propsName}.config });`,
    },
  ];

  tree.write(stagePath, applyChangesToString(source, changes));
}
