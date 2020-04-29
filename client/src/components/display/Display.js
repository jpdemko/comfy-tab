import * as React from "react"
import styled, { css } from "styled-components/macro"
import { TransitionGroup } from "react-transition-group"
import { throttle } from "throttle-debounce"
import { gsap } from "gsap/all"

import { getRect, ls, themes } from "../../shared/shared"
import About from "../about/About"
import Weather from "../weather/Weather"
import Chat from "../chat/Chat"
import Button from "../ui/Button"
import Window from "./Window"
import Nav from "./Nav"
import AppNav from "./AppNav"

/* --------------------------------- STYLES --------------------------------- */

const Root = styled.div`
	--nav-height: 2.25em;
	height: 100%;
	overflow: hidden;
`

const AllowedDragArea = styled.div`
	position: relative;
	height: calc(100% - var(--nav-height));
	overflow: hidden;
`

const DiagonalBG = styled.div`
	height: 100%;
	width: 100%;
	position: absolute;
	overflow: hidden;
	z-index: -1;
	${({ theme }) => css`
		background: ${theme.background};
		> div {
			height: 200%;
			width: 200%;
			background: ${theme.contrast};
			transform: translateY(20%) rotate(-10deg);
		}
	`}
`

// Didn't use CSS vars since used in JS computations and didn't export since only it's direct children use it.
const minWindowCSS = {
	width: 480,
	height: 320,
}

// Actual Window components use this wireframe's calculated px dimensions for their opening animation.
// Trying to animate the actual Windows when they have set % CSS applied doesn't give the desired resizing effect.
const WindowWireframe = styled.div`
	position: absolute;
	z-index: -5000;
	opacity: 0;
	${({ isMobileSite }) => css`
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		min-width: ${isMobileSite ? 120 : minWindowCSS.width}px;
		min-height: ${isMobileSite ? 80 : minWindowCSS.height}px;
		width: ${isMobileSite ? 100 : 65}%;
		height: ${isMobileSite ? 100 : 60}%;
	`}
`

const Shortcuts = styled.div`
	height: 100%;
	position: relative;
	z-index: 10; /* Need this because of absolute positioned background div. */
	--sc-padding: 0.75em;
	padding: var(--sc-padding);
	display: grid;
	${({ grid }) => css`
		grid-template-columns: repeat(${grid.cols}, 1fr);
		grid-template-rows: repeat(${grid.rows}, 1fr);
		grid-auto-flow: column;
		grid-gap: var(--sc-padding);
	`}
`

const ShortcutButton = styled(Button)`
	color: ${themes.dark.contrast};
	&& svg {
		width: auto;
		height: auto;
	}
`

/* -------------------------------- COMPONENT ------------------------------- */

export const mountableApps = {}
const appClasses = [About, Weather, Chat]
appClasses.forEach((app) => (mountableApps[app.shared.title] = app))

class Display extends React.Component {
	constructor(props) {
		super(props)
		const prevOpenedApps = (ls.get("Display-openedApps") || []).map((app) => this.genApp(app.title, app))
		this.state = {
			openedApps: prevOpenedApps,
			mainNavBurgerCB: null,
			grid: {
				rows: 1,
				cols: 1,
			},
		}

		// GSAP's Draggable has a shared z-index updater across all instances, however it doesn't update
		// in every circumstance we need it to.
		this.zIndexLeader = ls.get("Display-zIndexLeader") || 999
		this.setGridDimsThrottled = throttle(200, this.setGridDims)
		this.dragAreaRef = React.createRef()
	}

	componentDidMount() {
		this.setGridDims()
		window.addEventListener("resize", this.setGridDimsThrottled)
		window.addEventListener("beforeunload", this.save)
	}

	componentWillUnmount() {
		this.setGridDimsThrottled.cancel()
		window.removeEventListener("beforeunload", this.save)
		window.removeEventListener("resize", this.setGridDimsThrottled)
	}

	save = () => {
		let deconApps = []
		this.state.openedApps.forEach((app) =>
			deconApps.push({
				id: app.id,
				title: app.title,
				isFocused: app.isFocused,
				zIndex: app.zIndex,
			})
		)
		ls.set("Display-openedApps", deconApps)
		ls.set("Display-zIndexLeader", this.zIndexLeader)
	}

	setGridDims = () => {
		const { width, height } = getRect(this.dragAreaRef.current)
		const optCell = 16 * 7 + 16 * 0.75 // 7em + (1em * .75)
		const nextGrid = {
			rows: Math.floor(height / optCell) || 1,
			cols: Math.floor(width / optCell) || 1,
		}
		const { grid } = this.state
		if (nextGrid.rows !== grid.rows || nextGrid.cols !== grid.cols) this.setState({ grid: nextGrid })
	}

	genApp = (title, prevData = {}) => {
		return {
			title,
			id: Date.now(),
			class: mountableApps[title],
			windowRef: React.createRef(),
			isFocused: true,
			zIndex: ++this.zIndexLeader,
			...prevData,
		}
	}

	openApp = (title) => {
		const { openedApps } = this.state
		const curOpenApp = openedApps.find((oApp) => oApp.title === title)
		if (curOpenApp) {
			curOpenApp.windowRef.current.toggleMinimize()
			return
		}
		let nextOpenedApps = [...openedApps]
		nextOpenedApps.forEach((app) => (app.isFocused = false))
		nextOpenedApps.push(this.genApp(title))
		this.setState({ openedApps: nextOpenedApps })
	}

	closeApp = (curAppID) => {
		const { openedApps } = this.state
		this.focusBelowApp(openedApps.find((app) => app.id === curAppID)?.zIndex)
		this.setState((prevState) => ({
			openedApps: prevState.openedApps.filter((app) => app.id !== curAppID),
		}))
	}

	handleHomeButton = () => {
		const { openedApps } = this.state
		openedApps.forEach((app) => app.windowRef.current.minimize({ focusBelow: false }))
		const nextOpenedApps = openedApps.map((app) => {
			app.isFocused = false
			return app
		})
		this.setState({ openedApps: nextOpenedApps })
	}

	focusBelowApp = (curAppZ) => {
		const { openedApps } = this.state
		if (!curAppZ || openedApps?.length < 2) return
		let belowApp = null
		openedApps.forEach((app) => {
			if (app.windowRef.current.state.isMinimized) return
			else if (!belowApp && app.zIndex < curAppZ) belowApp = app
			else if (belowApp && app.zIndex < curAppZ && app.zIndex > belowApp.zIndex) belowApp = app
		})
		console.log("focusBelowApp() target: ", belowApp?.title)
		this.focusApp(belowApp?.id)
	}

	focusApp = (curAppID) => {
		const targetApp = this.state.openedApps.find((app) => app.id === curAppID)
		if (targetApp?.isFocused) {
			console.log("focusApp() targetApp.isFocused: ", targetApp?.isFocused)
			return false
		}

		let matched = false
		const nextOpenedApps = this.state.openedApps.map((app) => {
			matched = app.id === curAppID
			return {
				...app,
				isFocused: matched ? true : false,
				zIndex: matched ? ++this.zIndexLeader : app.zIndex,
			}
		})
		// console.log("focusApp() targetApp.isFocused: ", targetApp?.isFocused)
		this.setState({
			openedApps: nextOpenedApps,
			...(!matched && { mainNavBurgerCB: null }),
		})

		return matched
	}

	setMainNavBurgerCB = (mainNavBurgerCB) => {
		this.setState({ mainNavBurgerCB })
	}

	render() {
		return (
			<Root>
				<DiagonalBG>
					<div />
				</DiagonalBG>
				<AllowedDragArea ref={this.dragAreaRef} id="allowedDragArea">
					<Shortcuts grid={this.state.grid}>
						{Object.keys(mountableApps).map((key) => {
							const { title, logo, theme } = mountableApps[key].shared
							return (
								<ShortcutButton
									key={title}
									onClick={() => this.openApp(title)}
									variant="fancy"
									size="large"
									svg={logo}
									column
									theme={theme}
								>
									{title}
								</ShortcutButton>
							)
						})}
					</Shortcuts>
					{this.props.children}
					<WindowWireframe id="window-wireframe" isMobileSite={this.props.isMobileSite} />
					<TransitionGroup component={null}>
						{this.state.openedApps.map((app, i) => (
							<Window
								ref={app.windowRef}
								key={app.id}
								id={app.id}
								isMobileSite={this.props.isMobileSite}
								isFocused={app.isFocused}
								title={app.class.shared.title}
								minWindowCSS={minWindowCSS}
								closeApp={this.closeApp}
								focusApp={this.focusApp}
								zIndex={app.zIndex}
								focusBelowApp={this.focusBelowApp}
							>
								<AppNav
									isFocused={app.isFocused}
									isMobileSite={this.props.isMobileSite}
									setMainNavBurgerCB={this.setMainNavBurgerCB}
									app={app}
								/>
							</Window>
						))}
					</TransitionGroup>
				</AllowedDragArea>
				<Nav
					mountableApps={mountableApps}
					openedApps={this.state.openedApps}
					isMobileSite={this.props.isMobileSite}
					handleHomeButton={this.handleHomeButton}
					mainNavBurgerCB={this.state.mainNavBurgerCB}
					openApp={this.openApp}
					closeApp={this.closeApp}
				/>
			</Root>
		)
	}
}

export default Display
