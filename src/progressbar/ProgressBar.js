import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import earth from "../earthspin.mp4"

/**
 * Usage:
 * ```js
 * <LoadingBar URI={videoAsset}
 *      options={{
 *          hint: 'Video is loading',
 *          showHint: true
 * }} />
 * ```
 */
export default function LoadingBar(props) {
  // get URI for resource to load/download
  const URI = props.URI // this will need to throw error if not present
  if (!URI) {
    console.log(URI)
    // catch missing prop error
    throw new Error(
      "URI for file to download is required. (URI prop in LoadingBar component.)"
    )
  }

  // set options from props or use defaults
  const options = {
    displayPercent: props?.displayPercent !== undefined ? props?.displayPercent : true,
    hint: props?.hint || "Downloading",
    showHint: props?.showHint || false,
    doneMessage: props?.doneMessage || "Done!",
    smoothing: parseSmoothing(props?.smoothing),
    theme: props?.theme || "basic",
    colorPrimary: props?.colorPrimary || "white",
    colorSecondary: props?.colorSecondary || "white",
    colorText: props?.colorText || "white",
    delay: props?.delay || "1.2",
    height: props?.height || "30px",
    containerStyle: props?.containerStyle || {}
  }

  // setup state for readable stream progress
  const [progress, setProgress] = useState(0)
  const [size, setSize] = useState(0)
  const [received, setReceived] = useState(0)
  const [complete, setComplete] = useState(false)
  // start fetch and create readable stream
  useEffect(() => {
    get()
  }, []) // call upon component mount

  // second order functions passed in via props
  const onComplete = props.onComplete || null

  function get() {
    fetch(earth, {})
      .then((res) => {
        let size = res.headers.get("Content-Length")
        console.log("Total Size: " + size)
        setSize(size)
        return res.body
      })
      .then((body) => {
        let reader = body.getReader()
        return new ReadableStream({
          start(controller) {
            return pump()
            function pump() {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close()
                  setComplete(true)
                  return
                }
                controller.enqueue(value)
                let size = value.length
                setReceived((old) => old + size)
                console.log(size)
                return pump()
              })
            }
          },
        })
      })
  }

  // onComplete callback if provided by dev
  useEffect(() => {
    // if stream is complete and onComplete callback is provided, run callback
    if (complete && onComplete && typeof onComplete === "function") {
      // use delay parameter to time complete handler with animations
      setTimeout(() => {
        onComplete()
        // call oncomplete after animation delay and duration complete
      }, parseInt(options.delay) * 1000 + 1000)
    }
    return
  }, [complete])

  // chunk read callback
  useEffect(() => {
    console.log(received)
  }, [received])

  // optional element components
  const percentageElement = ( //percentage tracker
    <div
      style={{
        marginTop:'10px',
        opacity: !complete ? 1 : 0,
        transition: `opacity .4s ease-in`,
        transitionDelay: `${options.delay}s`,
      }}
    >
      <div style={{ fontWeight: "light" }}>
        {isNaN(((size / received) * 100).toFixed(0))
          ? 0
          : ((size / received) * 100).toFixed(0)}
        <span style={{ fontWeight: "bold", position: "relative" }}>%</span>
      </div>
    </div>
  )

  const hintElement = ( // hint element
    <div
      style={{
        marginTop:'10px',
        opacity: !complete ? 1 : 0,
        transition: `opacity .4s ease-in`,
        transitionDelay: `${options.delay}s`,
      }}
    >
      {options.hint}
    </div>
  )

  // styles
  const themes = {
    basic: {
      background: "rgba(255,255,255,.1)",
      border: `0px solid ${options.colorPrimary}`,
    },

    outline: {
      background: "transparent",
      border: `2px solid ${options.colorPrimary}`,
    },
    minimal: {
      background: "transparent",
      border: `1px solid ${options.colorPrimary}`,
    },
  }

  //  MARKUP
  return (
    // container element
    <div style={{...options.containerStyle}}>
      <div
        style={{
          color: `${options.colorText}`,
          width: `${!complete ? "300px" : "0px"}`,
          transition: "width .4s cubic-bezier(0.36, 0, 0.66, -0.56)",
          transitionDelay: `${options.delay}s`,
        }}
      >
        {/* outer part of loading bar */}
        <div
          className="react-loading-bar-outer"
          style={{
            border: `${themes[options.theme].border}`,
            borderRadius: "14px",
            background: `${themes[options.theme].background}`,
          }}
        >
          {/* inner animated part of loading bar */}
          <div
            className="react-loading-bar-inner"
            style={{
              width: `${((received / size) * 100).toFixed(0)}%`,
              height: "2px",
              background: `${options.colorPrimary}`,
              transition: `width ${options.smoothing} cubic-bezier(0.87, 0, 0.13, 1)`,
              borderRadius: "14px",
            }}
          ></div>
        </div>

        {/*  hint messsage true/false */}
        {options.showHint && (
          
            hintElement
         
        )}
        {/* percentage readout true/false */}
        {options.displayPercent && (
          
            percentageElement
          
        )}
      </div>
    </div>
  )
}

// propTypes
LoadingBar.propTypes = {
  /** {string} of path to asset location. */
  URI: PropTypes.string,
  /** {object} containing user defined styles in react inline-styles format. */
  containerStyle: PropTypes.object,
  /** {string} for use in list via array.map function */
  key: PropTypes.string,
  /** {function}: callback to fire (in parent component) on completion of download */
  onComplete: PropTypes.func,
  /** {string} message to display after download is complete */
  completeMessage: PropTypes.string,
  /** {boolean} modal determines if this behaves like a normally styled component, or if the loader will behave like a modal, taking up the whole pages focus */
  modal: PropTypes.bool,
  /** {boolean} display percentage complete in addition to progress bar */
  displayPercent: PropTypes.bool,
  /** {string} message to display while in progress */
  hint: PropTypes.string,
  /** {boolean} to show/hide hint message */
  showHint: PropTypes.bool,
  /** {string: low, medium, high} determines how smooth the animation of the progress bar is*/
  smoothing: PropTypes.string,
  /** {string: hex, rgb, rgba} primary color */
  colorPrimary: PropTypes.string,
  /** {string: hex, rgb, rgba} secondary color */
  colorSecondary: PropTypes.string,
  /** {string} text color */
  colorText: PropTypes.string,
  /** {string} preset style themes */
  theme: PropTypes.string,
  /** {string || number} width in px of bar */
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** {string || number} height of bar in px */
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

const animations = {}

function parseSmoothing(string) {
  if (string) {
    switch (string) {
      case "low":
        return ".05s"
        break
      case "medium":
        return ".2s"
        break
      case "high":
        return "1s"
        break
      default:
        return ".2s"
    }
  }
}