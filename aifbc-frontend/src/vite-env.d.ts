/// <reference types="vite/client" />

// This file is intentionally left blank to avoid ImportMeta redeclaration lint error.

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  // more env variables...
}
