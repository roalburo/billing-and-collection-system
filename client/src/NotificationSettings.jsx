import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import "./Tenants.css";

function NotificationSettings({ userId, closeModal }) {
    const [settings, setSettings] = useState({
        billingAlerts: true,
        maintenanceUpdates: true,
        contractRenewals: true,
    });

    useEffect(() => {
        if (!userId) {
            console.error('User ID is missing or undefined');
            return;
          }

        axios.get(`http://localhost:3001/notification-settings/${userId}`)
        .then((response) => {
        setSettings(response.data || {
            billingAlerts: true,
            maintenanceUpdates: true,
            contractRenewals: true,
        });
        })
        .catch((error) => console.error('Error fetching notification settings:', error));
      }, [userId]);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: checked
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userId) {
            console.error('User ID is missing for saving settings');
            return;
          }
        axios.post('http://localhost:3001/notification-settings/'+userId, settings)
            .then(() => alert('Settings updated successfully'))
            .catch(error => console.error(error));
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <h2>Email Notification Settings</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="billingAlerts"
                                checked={settings.billingAlerts}
                                onChange={handleChange}
                            />
                            Billing Alerts
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="maintenanceUpdates"
                                checked={settings.maintenanceUpdates}
                                onChange={handleChange}
                            />
                            Maintenance Updates
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="contractRenewals"
                                checked={settings.contractRenewals}
                                onChange={handleChange}
                            />
                            Contract Renewals
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary">Save Settings</button>
                </form>
            </div>
        </div>
    );
}
NotificationSettings.propTypes = {
    userId: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
};

export default NotificationSettings;