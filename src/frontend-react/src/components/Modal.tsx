type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
    contentClassName?: string;
};


export function Modal({ children, onClose, contentClassName }: ModalProps) {
    return (
        <div className="modal" onClick={onClose}>
            <div className={`modalContent${contentClassName ? ` ${contentClassName}` : ""}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
