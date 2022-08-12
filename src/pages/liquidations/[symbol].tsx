/* eslint-disable no-unused-vars*/
// eslint sucks at types
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { revalidate } from '~/api'
import { ChartData, getLatestChartData, getPrevChartData } from '~/utils/liquidations'

import Layout from '~/layout'
import { LiquidationsSearch } from '~/components/Search'
import { Header } from '~/Theme'
import { LiquidationsHeader } from '../../components/LiquidationsPage/LiquidationsHeader'
import { LiquidationsContent } from '../../components/LiquidationsPage/LiquidationsContent'
import styled from 'styled-components'
import React, { useState } from 'react'

export const getStaticProps: GetStaticProps<{ data: ChartData; prevData: ChartData }> = async ({ params }) => {
	const symbol = params.symbol as string
	const data = await getLatestChartData(symbol.toUpperCase(), 100)
	const prevData = await getPrevChartData(symbol.toUpperCase(), 100, 3600 * 24)
	return {
		props: { data, prevData },
		revalidate: revalidate(5)
	}
}

export const getStaticPaths: GetStaticPaths = async () => {
	// TODO: make api for all tracked symbols
	const paths = ['ETH', 'WBTC', 'USDC', 'DAI', 'YFI', 'UNI'].map((x) => ({
		params: { symbol: x.toLowerCase() }
	}))
	return { paths, fallback: 'blocking' }
}

export const LiquidationsContext = React.createContext<{
	selectedSeries: {
		[key: string]: boolean
	}
	setSelectedSeries: React.Dispatch<
		React.SetStateAction<{
			[key: string]: boolean
		}>
	>
}>(null)

const LiquidationsProvider = ({ children }) => {
	const [selectedSeries, setSelectedSeries] = useState<{ [key: string]: boolean }>({})

	return (
		<LiquidationsContext.Provider value={{ selectedSeries, setSelectedSeries }}>
			{children}
		</LiquidationsContext.Provider>
	)
}

const LiquidationsHomePage: NextPage<{ data: ChartData; prevData: ChartData }> = (props) => {
	const { data, prevData } = props
	return (
		<Layout title={`${data.coingeckoAsset.name} (${data.symbol}) Liquidation Levels - DefiLlama`} defaultSEO>
			<LiquidationsSearch step={{ category: 'Liquidation Levels', name: data.symbol, hideOptions: true }} />
			<Header>Liquidation levels in DeFi 💦</Header>
			<LiquidationsHeader {...data} />
			<LiquidationsProvider>
				<LiquidationsContent data={data} prevData={prevData} />
			</LiquidationsProvider>
			<SmolHints>
				<p>
					🔍
					<i> To see liquidation levels for other assets, just use the search bar above!</i>
				</p>
			</SmolHints>
		</Layout>
	)
}

const SmolHints = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	margin-top: -1rem;
	opacity: 0.6;
`

export default LiquidationsHomePage
