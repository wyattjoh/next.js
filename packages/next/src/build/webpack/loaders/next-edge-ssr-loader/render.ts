import type { NextConfig } from '../../../../server/config-shared'

import type { DocumentType, AppType } from '../../../../shared/lib/utils'
import type { BuildManifest } from '../../../../server/get-page-files'
import {
  LOADED_COMPONENT_TYPE,
  ReactLoadableManifest,
} from '../../../../server/load-components'
import type { FontLoaderManifest } from '../../plugins/font-loader-manifest-plugin'

import WebServer from '../../../../server/web-server'
import {
  WebNextRequest,
  WebNextResponse,
} from '../../../../server/base-http/web'
import { SERVER_RUNTIME } from '../../../../lib/constants'

export function getRender({
  dev,
  page,
  appMod,
  pageMod,
  errorMod,
  error500Mod,
  pagesType,
  Document,
  buildManifest,
  reactLoadableManifest,
  appRenderToHTML,
  pagesRenderToHTML,
  serverComponentManifest,
  subresourceIntegrityManifest,
  serverCSSManifest,
  config,
  buildId,
  fontLoaderManifest,
}: {
  pagesType: 'app' | 'pages' | 'root'
  dev: boolean
  page: string
  appMod: any
  pageMod: any
  errorMod: any
  error500Mod: any
  appRenderToHTML: any
  pagesRenderToHTML: any
  Document: DocumentType
  buildManifest: BuildManifest
  reactLoadableManifest: ReactLoadableManifest
  subresourceIntegrityManifest?: Record<string, string>
  serverComponentManifest: any
  serverCSSManifest: any
  appServerMod: any
  config: NextConfig
  buildId: string
  fontLoaderManifest: FontLoaderManifest
}) {
  const isAppPath = pagesType === 'app'
  const baseLoadComponentResult = {
    type: LOADED_COMPONENT_TYPE.PAGES as const,
    dev,
    buildManifest,
    reactLoadableManifest,
    subresourceIntegrityManifest,
    fontLoaderManifest,
    Document,
    App: appMod?.default as AppType,
  }

  const server = new WebServer({
    dev,
    conf: config,
    minimalMode: true,
    webServerConfig: {
      page,
      pagesType,
      extendRenderOpts: {
        buildId,
        runtime: SERVER_RUNTIME.experimentalEdge,
        supportsDynamicHTML: true,
        disableOptimizedLoading: true,
        serverComponentManifest,
        serverCSSManifest,
      },
      appRenderToHTML,
      pagesRenderToHTML,
      loadComponent: async (pathname) => {
        if (isAppPath) return null
        if (pathname === page) {
          return {
            ...baseLoadComponentResult,
            Component: pageMod.default,
            config: pageMod.config || {},
            getStaticProps: pageMod.getStaticProps,
            getServerSideProps: pageMod.getServerSideProps,
            getStaticPaths: pageMod.getStaticPaths,
            ComponentModule: pageMod,
            pathname,
          }
        }

        // If there is a custom 500 page, we need to handle it separately.
        if (pathname === '/500' && error500Mod) {
          return {
            ...baseLoadComponentResult,
            Component: error500Mod.default,
            config: error500Mod.config || {},
            getStaticProps: error500Mod.getStaticProps,
            getServerSideProps: error500Mod.getServerSideProps,
            getStaticPaths: error500Mod.getStaticPaths,
            ComponentModule: error500Mod,
            pathname,
          }
        }

        if (pathname === '/_error') {
          return {
            ...baseLoadComponentResult,
            Component: errorMod.default,
            config: errorMod.config || {},
            getStaticProps: errorMod.getStaticProps,
            getServerSideProps: errorMod.getServerSideProps,
            getStaticPaths: errorMod.getStaticPaths,
            ComponentModule: errorMod,
            pathname,
          }
        }

        return null
      },
    },
  })
  const requestHandler = server.getRequestHandler()

  return async function render(request: Request) {
    const extendedReq = new WebNextRequest(request)
    const extendedRes = new WebNextResponse()
    requestHandler(extendedReq, extendedRes)
    return await extendedRes.toResponse()
  }
}
