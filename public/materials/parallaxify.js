window.addEventListener("scroll", parallax)

function parallax() {

    let pixelsFromTop = document.documentElement.scrollTop

    let itemsToParallax = document.getElementsByClassName("parallaxify")

    for (let item of itemsToParallax) {

        if (!item.dataset.speedMultiplier) {

            item.dataset.speedMultiplier = "0.7"
        }
        item.style.position = "relative"

        item.style.top = pixelsFromTop * item.dataset.speedMultiplier + "px"
    }

    let imagesToParallax = document.getElementsByClassName("parallaxifyBg")

    for (let item of imagesToParallax) {

        function getPosition(item) {

            let top = (item.getBoundingClientRect().top / window.innerHeight * 100).toFixed(0)

            return top
        }

        if (!item.dataset.speedMultiplier) {

            item.dataset.speedMultiplier = "0.5"
        }

        item.style.backgroundAttachment = "none"
        item.style.backgroundPositionY = getPosition(item) * item.dataset.speedMultiplier + "%"
    }
}