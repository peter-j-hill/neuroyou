import { MDXRemote } from 'next-mdx-remote/rsc'
import Diagram from '@/components/Diagram'

const mdxComponents = {
  Diagram,
}

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="prose">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  )
}
