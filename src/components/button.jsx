"use client"
import "../styles/Button.css"

const Button = ({ variant = "primary", onClick, children, disabled = false, className = "", type = "button" }) => {
  const getButtonClass = () => {
    switch (variant) {
      case "save":
        return "save-button"
      case "update":
        return "update-button"
      case "cancel":
        return "cancel-button"
      case "uncancel":
        return "uncancel-button"
      case "add-row":
        return "add-row-button"
      default:
        return "primary-button"
    }
  }

  return (
    <button type={type} className={`${getButtonClass()} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// Button functions that can be exported
export const SaveButton = ({ onClick, disabled, children = "Save" }) => {
  return (
    <Button variant="save" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  )
}

export const UpdateButton = ({ onClick, disabled = false, children = "Update" }) => {
  return (
    <Button variant="update" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  )
}

export const CancelButton = ({ onClick, disabled, label = "Cancel" }) => {
  return (
    <Button variant="cancel" onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  )
}

export const UncancelButton = ({ onClick, label = "Uncancel" }) => {
  return (
    <Button variant="uncancel" onClick={onClick}>
      {label}
    </Button>
  )
}

export const AddRowButton = ({ onClick, disabled, children = "+ Add Row" }) => {
  return (
    <Button variant="add-row" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  )
}

export default Button
