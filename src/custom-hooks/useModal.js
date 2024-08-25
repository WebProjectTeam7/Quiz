import { useState } from 'react';

export default function useModal() {
    const [isModalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    return {
        isModalVisible,
        openModal,
        closeModal,
    };
}
