/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-outside',
      comment: 'Domain layer must not import from application, infrastructure, or interface layers',
      severity: 'error',
      from: { path: '^src/domain' },
      to: {
        path: '^src/(application|infrastructure|interface)',
      },
    },
    {
      name: 'no-application-to-infrastructure',
      comment: 'Application layer must not import from infrastructure or interface layers',
      severity: 'error',
      from: { path: '^src/application' },
      to: {
        path: '^src/(infrastructure|interface)',
      },
    },
    {
      name: 'no-application-to-interface',
      comment: 'Application layer must not import from interface layer',
      severity: 'error',
      from: { path: '^src/application' },
      to: {
        path: '^src/interface',
      },
    },
    {
      name: 'no-circular',
      comment: 'No circular dependencies allowed',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.js', '.ts', '.d.ts'],
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
