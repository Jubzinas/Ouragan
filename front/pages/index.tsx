import { ConnectWallet } from '@/components/buttons'
import { Layout } from '@/components/layout'
import { Art } from '@/components/misc/art'
import { useOuragan } from '@/hooks/useOuragan'

export default function Home() {
  const { depositAmount } = useOuragan();

  return (
    <Layout>
      <div className='flex justify-center'>
        <Art />
      </div>
      <div className='py-5'>
        <ConnectWallet />
      </div>
    </ Layout>
  )
}
