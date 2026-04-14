type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
};


export function Modal({ children, onClose }: ModalProps) {
    return (
        <div className="modal" onClick={onClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}