/* eslint-disable jsx-a11y/label-has-associated-control */

import { useState, useRef, useContext, useEffect } from "react"
import styled, { css } from "styled-components/macro"

import { ReactComponent as CloseSVG } from "../../shared/assets/icons/close.svg"
import { ReactComponent as ArrowRightSVG } from "../../shared/assets/icons/arrow-right.svg"
import { ReactComponent as UserSVG } from "../../shared/assets/icons/user.svg"
import { ReactComponent as GroupAddSVG } from "../../shared/assets/icons/group-add.svg"
import { ReactComponent as AddSVG } from "../../shared/assets/icons/add.svg"
import { ReactComponent as ChatSVG } from "../../shared/assets/icons/chat.svg"
import { Contexts } from "../../shared/shared"
import Button from "../ui/Button"
import Modal from "../ui/Modal"
import { Input } from "../ui/IO"
import Accordion from "../ui/Accordion"

/* --------------------------------- STYLES --------------------------------- */

const DrawerRoot = styled.div`
	--chatnav-padding: 0.4em;
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	${({ theme, isMobileWindow }) => css`
		border-right: ${isMobileWindow ? "none" : `1px solid ${theme.accent}`};
	`}
`

const Header = styled.div`
	flex: 0 0 auto;
	padding: var(--chatnav-padding) calc(var(--chatnav-padding) * 2);
	display: flex;
	align-items: center;
`

const RoomsSubHeader = styled.div`
	height: 1.5em;
	margin-left: var(--chatnav-padding);
	display: flex;
`

const Title = styled.span`
	font-weight: 500;
	font-style: italic;
	text-transform: uppercase;
`

const HeaderBtn = styled(Button)`
	margin-left: calc(var(--chatnav-padding) * 2);
`

const Rooms = styled.div`
	padding: var(--chatnav-padding);
`

const Room = styled.div`
	padding: calc(var(--chatnav-padding) / 2);
	> div {
		padding-top: calc(var(--chatnav-padding) / 2);
	}
	${({ isFocused, theme }) => css`
		background: ${isFocused ? theme.altBackground : "none"};
	`}
`

const RoomData = styled.div``

const RoomDataBtn = styled(Button)`
	button {
		height: 100%;
	}
	${({ isFocused }) => css`
		svg {
			transform: rotate(${isFocused ? "90deg" : "0"});
		}
	`}
`

const User = styled(Button)`
	margin-left: calc(var(--chatnav-padding) * 6);
`

const RoomCloseBtn = styled(Button)`
	margin-left: var(--chatnav-padding);
`

const DMs = styled.div`
	display: flex;
	flex-direction: column;
	padding: var(--chatnav-padding);
`

const LastDM = styled(Button)`
	padding: 0 var(--chatnav-padding);
	text-align: left;
	margin-bottom: var(--chatnav-padding);
	&:last-child {
		margin-bottom: 0;
	}
	${({ theme }) => css`
		background: ${theme.altBackground};
		border: 1px solid ${theme.accent};
		.last-dm-row {
			padding: var(--chatnav-padding);
			svg {
				margin-right: var(--chatnav-padding);
			}
		}
		.last-dm-row:first-child {
			display: inline-block;
			border-bottom: 1px solid ${theme.accent};
		}
	`}
`

const ModalRoot = styled.div`
	--modal-padding: 0.5em;
	min-width: max-content;
	padding: var(--modal-padding) calc(var(--modal-padding) * 2);
	form > div {
		padding: var(--modal-padding);
	}
	${({ theme }) => css`
		background: ${theme.altBackground};
		border: 1px solid ${theme.accent};
		color: ${theme.contrast};
	`}
`

const Data = styled.div`
	display: inline-flex;
	align-items: center;
`

const Empha = styled.span`
	font-weight: 500;
`

const Lessen = styled.span`
	margin-left: 0.9em;
	opacity: 0.8;
	font-weight: 400;
	font-size: 0.8em;
`

const DmTextSum = styled.span`
	font-size: 0.8em;
	font-weight: 400;
`

/* -------------------------------- COMPONENT ------------------------------- */

function ChatNav({ myRooms, myDMs, curRoomRID, createRoom, joinRoom, deleteRoom, sendDM, user }) {
	const { setAppDrawerContent, isMobileWindow } = useContext(Contexts.Window)

	const [rname, setRName] = useState("")
	const [password, setPassword] = useState("")
	const [rid, setRID] = useState("")

	const [modalShown, setModalShown] = useState(false)
	const [createConfig, setCreateConfig] = useState(true)

	const createRoomModalRef = useRef()
	const createRoomModal = (
		<ModalRoot>
			<form onSubmit={submitCreateRoom}>
				<div>
					<Empha>Create room config!</Empha>
				</div>
				<div>
					<label>
						<span>Room name:</span>
						<br />
						<Input
							type="text"
							placeholder="Room name required..."
							value={rname}
							onChange={(e) => setRName(e.target.value)}
							minLength="1"
							required
							ref={createRoomModalRef}
						/>
					</label>
				</div>
				<div>
					<label>
						<span>Room password:</span>
						<br />
						<Input
							type="password"
							placeholder="Optional room password..."
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							minLength="6"
						/>
					</label>
				</div>
				<div>
					<Button type="submit" variant="fancy">
						Submit
					</Button>
				</div>
			</form>
		</ModalRoot>
	)

	const joinRoomModalRef = useRef()
	const joinRoomModal = (
		<ModalRoot>
			<form onSubmit={submitJoinRoom}>
				<div>
					<Empha>Join room config!</Empha>
				</div>
				<div>
					<label>
						<span>Join room ID#:</span>
						<br />
						<Input
							type="text"
							placeholder="Room ID# required..."
							value={rid}
							onChange={(e) => setRID(e.target.value)}
							minLength="1"
							required
							ref={joinRoomModalRef}
						/>
					</label>
				</div>
				<div>
					<label>
						<span>Does target room have password?</span>
						<br />
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							minLength="6"
						/>
					</label>
				</div>
				<div>
					<Button type="submit" variant="fancy">
						Submit
					</Button>
				</div>
			</form>
		</ModalRoot>
	)

	function togCreateRoomModal(e) {
		e.stopPropagation()
		setCreateConfig(true)
		setModalShown(true)
	}
	function togJoinRoomModal(e) {
		e.stopPropagation()
		setCreateConfig(false)
		setModalShown(true)
	}

	useEffect(() => {
		if (modalShown) {
			const ref = createConfig ? createRoomModalRef : joinRoomModalRef
			if (ref.current) ref.current.focus()
		}
	}, [createConfig, modalShown])

	function submitJoinRoom(e) {
		e.preventDefault()
		const fixRID = Object.prototype.toString.call(rid) === "[object String]" ? Number.parseInt(rid) : rid
		let roomVars = { rid: fixRID, password: password?.length < 6 ? null : password }
		joinRoom({ room: roomVars })
			.then(() => setModalShown(false))
			.catch(console.error)
			.finally(() => {
				setRID("")
				setPassword("")
			})
	}

	function submitCreateRoom(e) {
		e.preventDefault()
		createRoom({ rname, password: password?.length < 6 ? null : password })
			.then(() => setModalShown(false))
			.catch(console.error)
			.finally(() => {
				setRName("")
				setPassword("")
			})
	}

	function joinPrevRoom(room) {
		joinRoom({ room }).then(console.log).catch(console.error)
	}

	const accordionData = [
		{
			id: 1,
			title: (
				<Header>
					<Title>Rooms</Title>
					<RoomsSubHeader>
						<HeaderBtn svg={AddSVG} variant="outline" onClick={togCreateRoomModal}>
							Create
						</HeaderBtn>
						<HeaderBtn svg={GroupAddSVG} variant="outline" onClick={togJoinRoomModal}>
							Join
						</HeaderBtn>
					</RoomsSubHeader>
				</Header>
			),
			content: (
				<Rooms>
					{myRooms &&
						curRoomRID &&
						Object.keys(myRooms).map((rid) => (
							<Room key={rid} isFocused={rid == curRoomRID}>
								<RoomData>
									<RoomDataBtn
										svg={ArrowRightSVG}
										isFocused={rid == curRoomRID}
										onClick={() => joinPrevRoom(myRooms[rid])}
										badge={myRooms[rid]?.msgs?.unread > 0 ? myRooms[rid]?.msgs?.unread : null}
									>
										<Data>
											<span>{myRooms[rid]?.rname}</span>
											<Lessen>RID#{rid}</Lessen>
										</Data>
									</RoomDataBtn>
									<RoomCloseBtn svg={CloseSVG} color="red" onClick={() => deleteRoom(rid)} />
								</RoomData>
								{rid == curRoomRID &&
									myRooms[curRoomRID]?.activeUsers &&
									Object.keys(myRooms[curRoomRID]?.activeUsers)?.map((uid) => {
										const actUser = myRooms[curRoomRID].activeUsers[uid]
										return (
											<div key={uid}>
												<User
													svg={UserSVG}
													isFocused={actUser.uid == user.uid}
													onClick={() => sendDM(actUser.uid)}
												>
													{actUser.uname}
												</User>
											</div>
										)
									})}
							</Room>
						))}
				</Rooms>
			),
		},
		{
			id: 2,
			title: (
				<Header>
					<Title>DMs</Title>
				</Header>
			),
			content: (
				<DMs>
					{myDMs &&
						myDMs?.map((dmSum) => (
							<LastDM key={dmSum.recip_id} column>
								<div className="last-dm-row">
									<UserSVG />
									<span style={{ fontStyle: "italic" }}>{dmSum.recip_uname}</span>
								</div>
								<div className="last-dm-row">
									<ChatSVG />
									<DmTextSum>{dmSum.msg}</DmTextSum>
								</div>
							</LastDM>
						))}
				</DMs>
			),
		},
	]

	const drawerContent = (
		<DrawerRoot>
			<Accordion data={accordionData} />
		</DrawerRoot>
	)
	// Can't update during an existing state transition. So defer it.
	useEffect(() => setAppDrawerContent(drawerContent))

	return (
		<>
			<Modal isShown={modalShown} onClose={() => setModalShown(false)}>
				{createConfig ? createRoomModal : joinRoomModal}
			</Modal>
			{!isMobileWindow && drawerContent}
		</>
	)
}

export default ChatNav
