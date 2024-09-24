import React from 'react';

const JustificativoModal = ({ isOpen, onClose, onSubmit, currentJustificativo }) => {
    const [justificativo, setJustificativo] = React.useState(currentJustificativo);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(justificativo);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <h2>Editar Justificativo</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        <input 
                            type="radio" 
                            value={true} 
                            checked={justificativo === true} 
                            onChange={() => setJustificativo(true)} 
                        />
                        Presenta Justificativo
                    </label>
                    <br />
                    <label>
                        <input 
                            type="radio" 
                            value={false} 
                            checked={justificativo === false} 
                            onChange={() => setJustificativo(false)} 
                        />
                        No Presenta Justificativo
                    </label>
                    <br />
                    <button type="submit">Guardar</button>
                    <button type="button" onClick={onClose}>Cancelar</button>
                </form>
            </div>
        </div>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
};

export default JustificativoModal;
