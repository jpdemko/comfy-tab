export function getStyleProperty(ele, prop, parseValue = false) {
	const styleProp = window.getComputedStyle(ele).getPropertyValue(prop)
	return parseValue ? parseFloat(styleProp.match(/\d+\.?\d*/)[0]) : styleProp
}

export function simplerFetch(url, action) {
	return fetch(url)
		.then((res) => {
			if (!res.ok) throw Error(`bad response --> code ${res.status}`)
			return res.json()
		})
		.catch((err) => {
			let output = `${action} error: ${err.message}`
			console.log(output)
			Promise.reject(output)
		})
}

export function propStartsWith(prop, char) {
	return prop ? prop.toLowerCase().startsWith(char) : false
}

export function getBounds(target) {
	target = typeof target === 'string' ? document.getElementById(target) : target
	return target.getBoundingClientRect()
}
