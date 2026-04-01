import "./ProviderPortal.css"
import { useLocation } from "react-router-dom"

function ProviderPortal() {

    const { name } = useLocation().state.provider

  return (
    <>
    <h1>ProviderPortal</h1>

    <div>Provider Name: {name}</div>
    </>
  )
}

export default ProviderPortal