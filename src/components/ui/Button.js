import React from 'react'
import styled, { css } from 'styled-components/macro'

import { safeTranslate, opac } from '../../shared/shared'

/* --------------------------------- STYLES --------------------------------- */

export const ButtonBase = styled.button.attrs(({ size = 1, svg }) => {
	let sizeModifier = 1
	if (size) {
		if (size === 'small') sizeModifier = 0.75
		else if (size === 'large') sizeModifier = 1.25
	}

	let varCSS = {
		fontSize: `calc(1em * ${sizeModifier})`,
		sidePadding: `calc(0.6em * ${sizeModifier})`,
		verticalPadding: `calc(0.25em * ${sizeModifier})`,
	}

	if (svg) {
		varCSS = {
			...varCSS,
			sidePadding: `calc(${varCSS.sidePadding} / 2)`,
			verticalPadding: `calc(${varCSS.verticalPadding} / 2)`,
		}
	}

	return { varCSS }
})`
	display: inline-flex;
	justify-content: center;
	align-items: center;
	border: none;
	background: none;
	transition: opacity 0.2s, background 0.15s, box-shadow 0.15s, outline 0.1s;
	font-weight: 500;
	outline: none;
	${({ theme, varCSS, disabled, svgAdjust }) => css`
		box-shadow: 0 0 0 0 ${theme.mainColor};
		font-size: ${varCSS.fontSize};
		padding: ${varCSS.verticalPadding} ${varCSS.sidePadding};
		color: ${theme.mainColor};
		opacity: ${disabled ? 0.33 : 1};
		cursor: ${disabled ? 'default' : 'pointer'};
		&:active {
			box-shadow: 0 0 0 3px ${theme.mainColor};
		}
		svg {
			${svgAdjust &&
				css`
					transform: ${safeTranslate(svgAdjust)};
				`}
		}
		svg + span {
			margin: 0 ${varCSS.sidePadding};
		}
	`}
`

const BasicButton = styled(ButtonBase)`
	${({ theme, isFocused }) => css`
		background: ${isFocused ? opac(0.2, theme.mainColor) : 'none'};
		&:focus {
			background: ${opac(0.1, theme.mainColor)};
		}
		&:hover {
			background: ${opac(0.3, theme.mainColor)};
		}
		&:active {
			background: ${opac(0.4, theme.mainColor)};
		}
	`}
`

const OutlinedButton = styled(BasicButton)`
	margin: 1px;
	${({ theme }) => css`
		box-shadow: 0 0 0 1px ${theme.mainColor};
	`}
`

const FancyButton = styled(ButtonBase)`
	margin: 1px;
	color: white;
	${({ theme, isFocused }) => css`
		background-image: ${theme.gradient};
		box-shadow: 0 1px 13px 1px ${opac(0.4, theme.mixedColor)};
		opacity: ${isFocused ? 0.85 : 1};
		&:focus {
			opacity: 0.85;
		}
		&:hover {
			box-shadow: 0 1px 16px 2px ${opac(0.3, theme.mixedColor)}, 0 0 0 1px ${theme.mixedColor};
			opacity: 0.7;
		}
		&:active {
			box-shadow: 0 1px 20px 2px ${opac(0.2, theme.mixedColor)}, 0 0 0 3px ${theme.mixedColor};
			opacity: 1;
		}
	`}
`

/* -------------------------------- COMPONENT ------------------------------- */

const Button = ({ tag, variant, children, ...props }) => {
	let ButtonVariant = BasicButton
	if (variant) {
		if (variant.includes('outline')) ButtonVariant = OutlinedButton
		else if (variant === 'fancy') ButtonVariant = FancyButton
	}

	return (
		<ButtonVariant as={tag} {...props}>
			{props.svg && <props.svg />}
			{children}
		</ButtonVariant>
	)
}

export default Button
