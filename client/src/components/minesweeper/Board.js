import { useContext, useEffect, useMemo, useRef, useState } from "react"
import styled, { css, ThemeContext } from "styled-components/macro"

import { useEventListener, usePrevious, useUpdatedValRef } from "../../shared/hooks"
import { themes } from "../../shared/shared"
import { MsDifs } from "./Minesweeper"
import Cell from "./Cell"

/* --------------------------------- STYLES --------------------------------- */

const BRoot = styled.div`
	display: grid;
	flex: 1 1;
	overflow-y: auto;
	overflow-x: hidden;
	user-select: none;
	${({ rows, cols, isVert }) => css`
		grid-template-columns: repeat(${isVert ? rows : cols}, 1fr);
		grid-template-rows: repeat(${isVert ? cols : rows}, 1fr);
	`}
`

/* -------------------------------------------------------------------------- */

function useMouse(rootRef, cbLeft, cbBoth, cbRight, stopOnAny = []) {
	const stop = stopOnAny.some((cond) => cond)
	const stopRef = useUpdatedValRef(stop)

	const cbLeftRef = useUpdatedValRef(cbLeft)
	const cbBothRef = useUpdatedValRef(cbBoth)
	const cbRightRef = useUpdatedValRef(cbRight)

	const leftDownRef = useRef(false)
	const rightDownRef = useRef(false)

	function handleMouseDown(e) {
		e.preventDefault()
		if (stopRef.current) return
		if (e.button === 0) {
			leftDownRef.current = true
		} else if (e.button === 2) {
			rightDownRef.current = true
		}
	}

	const resetMS = 150
	const onCD = useRef()
	function handleMouseUp(e) {
		if (onCD.current || stopRef.current) return
		const coords = getCoords(e)
		const bothDown = leftDownRef.current && rightDownRef.current
		if (bothDown || e.button === 1) {
			if (bothDown) {
				onCD.current = true
				setTimeout(() => {
					onCD.current = false
				}, resetMS)
			}
			rightDownRef.current = false
			leftDownRef.current = false
			cbBothRef.current?.(coords)
		} else if (e.button === 0 && leftDownRef.current) {
			leftDownRef.current = false
			cbLeftRef.current?.(coords)
		} else if (e.button === 2 && rightDownRef.current) {
			rightDownRef.current = false
			cbRightRef.current?.(coords)
		}
	}

	useEventListener(rootRef, "mousedown", handleMouseDown)
	useEventListener(rootRef, "mouseup", handleMouseUp)
}

function getCoords(e) {
	const coords = e?.target
		?.closest("[id]")
		?.id?.split(",")
		?.map((s) => parseInt(s))
	return coords
}

function getRandomIntInclusive(min, max) {
	const randomBuffer = new Uint32Array(1)

	window.crypto.getRandomValues(randomBuffer)

	let randomNumber = randomBuffer[0] / (0xffffffff + 1)

	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(randomNumber * (max - min + 1)) + min
}

function getGrid(dif, isVert) {
	const grid = {
		rows: isVert ? dif.cols : dif.rows,
		cols: isVert ? dif.rows : dif.cols,
	}
	return grid
}

/* -------------------------------- COMPONENT ------------------------------- */

let board = []

function Board({
	children,
	isVert,
	isDesktop,
	title,
	isMobileSite,
	gameState: gs,
	setGameState,
	pauseTimer,
	...props
}) {
	const { game_id, started, lost, won, difficulty: difName, unopened, mines, flags } = gs
	const gsRef = useUpdatedValRef(gs)
	const stop = lost || won

	const dif = MsDifs[difName]

	// const firstGrid = getGrid(dif, isVert)
	const gridRef = useRef()
	useEffect(() => {
		gridRef.current = getGrid(dif, isVert)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dif, isVert])

	const startedRef = useRef(started ?? false)

	const [gameBoard, setBoard] = useState(() => [...board])
	const boardRef = useRef()

	// Generate color map for cells based on current theme and some defaults.
	const curTheme = useContext(ThemeContext)
	const colorMap = [
		themes.blue.highlight,
		themes.green.highlight,
		themes.red.highlight,
		themes.purple.highlight,
		curTheme.accent,
		themes.dark.highlight,
		curTheme.backgroundContrast,
		themes.purple.accent,
	]

	// When to generate a new game.
	const prevID = usePrevious(game_id)
	useEffect(() => {
		if (prevID !== game_id) {
			setBoard(genBlankBoard())
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gs])

	// Whenever gameBoard gets updated go through the cells and determine current gameState in parent.
	const checkGameStateRef = useUpdatedValRef(checkGameState)
	function checkGameState() {
		const ngs = {
			unopened: 0,
			flags: 0,
		}
		const minesArr = []
		board.forEach((r, i) => {
			r?.forEach?.((c, j) => {
				const cell = board?.[i]?.[j]
				if (!cell) return
				if (cell.isMine) minesArr.push(cell)
				if (cell.isFlagged) ngs.flags++
				if (!cell.isDug) ngs.unopened++
				else if (cell.isDug) {
					if (cell.isMine) ngs.lost = true
					else if (!started) ngs.started = true
				}
			})
		})
		if (!lost && ngs?.lost) {
			minesArr.forEach((m) => {
				if (!m.isFlagged) m.isDug = true
			})
			setBoard([...board])
		} else if (!ngs.lost && ngs.unopened === mines) {
			ngs.won = true
		}
		if (ngs.lost || ngs.won) {
			pauseTimer()
		}
		if (ngs.unopened !== unopened || ngs.flags !== flags) {
			setGameState((prev) => ({ ...prev, ...ngs }))
		}
	}

	useEffect(() => {
		checkGameStateRef.current?.()
	}, [gameBoard, checkGameStateRef])

	function genBlankBoard() {
		const { rows, cols } = gridRef.current
		if (!isNaN(rows) && !isNaN(cols)) {
			board = new Array(rows).fill(null).map((r, i) =>
				new Array(cols).fill(null).map((c, j) => ({
					id: `${i},${j}`,
					coords: [i, j],
					isDug: false,
					isFlagged: false,
					isMine: false,
					surMines: 0,
				}))
			)
		}
		startedRef.current = false
		return board
	}

	function fillBoard(coords) {
		const { rows, cols } = gridRef.current
		if (!rows || !cols) return

		const skippedCells = getSurCells(coords, true)
		let fb = board.flat()
		fb = fb.filter((c) => skippedCells.indexOf(c) < 0)
		let m = gsRef.current.mines
		while (m-- > 0) {
			const i = getRandomIntInclusive(0, fb.length - 1)
			const cell = fb?.[i]
			if (cell) {
				cell.isMine = true
				getSurCells(cell.coords).forEach((sc) => sc.surMines++)
			}
			fb.splice(i, 1)
		}
	}

	function getSurCells(coords, includeOrigin = false) {
		const [r, c] = coords
		const surCells = []
		if (!isNaN(r) && !isNaN(c)) {
			for (let i = r - 1; i <= r + 1; i++) {
				for (let j = c - 1; j <= c + 1; j++) {
					const sameCell = i === r && j === c
					const cell = board?.[i]?.[j]
					if (!cell || (cell && sameCell && !includeOrigin)) continue
					else surCells.push(cell)
				}
			}
		}
		return surCells
	}

	function dig(coords, skipUpdate = false) {
		if (stop) return
		if (!startedRef.current) {
			startedRef.current = true
			fillBoard(coords)
		}
		const [r, c] = coords
		const cell = board?.[r]?.[c]
		if (!cell || cell.isFlagged || cell.isDug) return

		cell.isDug = true
		if (!cell.isMine && cell.surMines === 0) getSurCells(coords).forEach((c) => dig(c.coords, true))

		if (!skipUpdate) {
			setBoard([...board])
		}
	}

	function flag(coords) {
		if (stop) return

		const [r, c] = coords
		const cell = board[r][c]
		if (!cell || cell.isDug) return
		else {
			cell.isFlagged = !cell.isFlagged
			setBoard([...board])
		}
	}

	function digArea(coords) {
		if (stop) return

		const [r, c] = coords
		const cell = board[r][c]
		if (!cell || !cell.isDug || cell.surMines < 1) return

		const surNotDugCells = getSurCells(coords).filter((sc) => !sc.isDug)
		const flagsMatch = surNotDugCells.filter((sc) => sc.isFlagged).length === cell.surMines
		const containsUnopened = surNotDugCells.some((sc) => !sc.isDug && !sc.isFlagged)
		const surUnopenedCells = surNotDugCells.filter((sc) => !sc.isFlagged)
		if (flagsMatch && containsUnopened) {
			surUnopenedCells.forEach((sc) => dig(sc.coords, true))
			setBoard([...board])
		}
	}

	useMouse(boardRef, dig, digArea, flag, [stop, isMobileSite])

	// Flatten 2D board array.
	let flatBoard = useMemo(() => {
		return gameBoard.reduce((acc, r, i) => {
			const flip = i % 2
			r.forEach((c, j) => {
				const altPattern = j % 2 === flip
				return acc.push(
					<Cell
						game_id={game_id}
						key={c.id}
						id={c.id}
						data={{ ...c }}
						altPattern={altPattern}
						isMobileSite={isMobileSite}
						colorMap={colorMap}
						boardRef={boardRef}
						dig={dig}
						flag={flag}
						digArea={digArea}
					/>
				)
			})
			return acc
		}, [])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isVert, gameBoard, isMobileSite])

	return (
		<BRoot
			{...props}
			ref={boardRef}
			id="ms-board"
			rows={dif.rows}
			cols={dif.cols}
			isVert={isVert}
			isDesktop={isDesktop}
			onContextMenu={(e) => {
				e.preventDefault()
				return false
			}}
		>
			{flatBoard}
		</BRoot>
	)
}

export default Board
