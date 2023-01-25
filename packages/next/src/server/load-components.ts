import type {
  AppType,
  DocumentType,
  NextComponentType,
} from '../shared/lib/utils'
import type {
  PageConfig,
  GetStaticPaths,
  GetServerSideProps,
  GetStaticProps,
} from 'next/types'
import {
  BUILD_MANIFEST,
  REACT_LOADABLE_MANIFEST,
  FLIGHT_MANIFEST,
  SERVER_DIRECTORY,
} from '../shared/lib/constants'
import { join } from 'path'
import { requirePage } from './require'
import { BuildManifest } from './get-page-files'
import { interopDefault } from '../lib/interop-default'

export type ManifestItem = {
  id: number | string
  files: string[]
}

export type ReactLoadableManifest = { [moduleId: string]: ManifestItem }

export enum LOADED_COMPONENT_TYPE {
  PAGES,
  APP_PAGE,
}

interface SharedLoadedComponents {
  Component: NextComponentType
  ComponentModule: any
}

interface LoadedPagesComponents extends SharedLoadedComponents {
  type: LOADED_COMPONENT_TYPE.PAGES
  App: AppType
  Document: DocumentType
  config: PageConfig
  subresourceIntegrityManifest?: Record<string, string>
  getStaticProps?: GetStaticProps
  getStaticPaths?: GetStaticPaths
  getServerSideProps?: GetServerSideProps
}

interface LoadedAppPageComponents extends SharedLoadedComponents {
  type: LOADED_COMPONENT_TYPE.APP_PAGE
  serverComponentManifest: any
}

export type LoadedComponents = (
  | LoadedPagesComponents
  | LoadedAppPageComponents
) & {
  buildManifest: BuildManifest
  reactLoadableManifest: ReactLoadableManifest
}

export async function loadDefaultErrorComponents(
  distDir: string
): Promise<LoadedComponents> {
  const Document = interopDefault(require('next/dist/pages/_document'))
  const App = interopDefault(require('next/dist/pages/_app'))
  const ComponentModule = require('next/dist/pages/_error')
  const Component = interopDefault(ComponentModule)

  return {
    type: LOADED_COMPONENT_TYPE.PAGES,
    Component,
    ComponentModule,
    App,
    Document,
    config: {},
    buildManifest: require(join(distDir, `fallback-${BUILD_MANIFEST}`)),
    reactLoadableManifest: {},
  }
}

async function loadPagesComponents(
  pathname: string,
  distDir: string
): Promise<LoadedPagesComponents> {
  const [AppModule, DocumentModule, ComponentModule] = await Promise.all([
    requirePage('/_app', distDir, false),
    requirePage('/_document', distDir, false),
    requirePage(pathname, distDir, false),
  ])

  return {
    type: LOADED_COMPONENT_TYPE.PAGES,
    App: interopDefault(AppModule),
    Document: interopDefault(DocumentModule),
    Component: interopDefault(ComponentModule),
    ComponentModule,
    config: ComponentModule.config ?? {},
    getServerSideProps: ComponentModule.getServerSideProps,
    getStaticProps: ComponentModule.getStaticProps,
    getStaticPaths: ComponentModule.getStaticPaths,
  }
}

async function loadAppPageComponents(
  pathname: string,
  distDir: string
): Promise<LoadedAppPageComponents> {
  const ComponentModule = await requirePage(pathname, distDir, true)

  return {
    type: LOADED_COMPONENT_TYPE.APP_PAGE,
    Component: interopDefault(ComponentModule),
    ComponentModule,
    serverComponentManifest: require(join(
      distDir,
      SERVER_DIRECTORY,
      FLIGHT_MANIFEST + '.json'
    )),
  }
}

export async function loadComponents({
  isAppPath,
  pathname,
  distDir,
}: {
  pathname: string
  distDir: string
  isAppPath: boolean
}): Promise<LoadedComponents> {
  const components = isAppPath
    ? await loadAppPageComponents(pathname, distDir)
    : await loadPagesComponents(pathname, distDir)

  return {
    ...components,
    buildManifest: require(join(distDir, BUILD_MANIFEST)),
    reactLoadableManifest: require(join(distDir, REACT_LOADABLE_MANIFEST)),
  }
}
