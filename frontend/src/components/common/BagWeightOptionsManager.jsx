import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';
import DialogBox from './DialogBox';
import FormInput from './FormInput';
import Icon from './Icon';
import { 
  getBagWeightOptions, 
  createBagWeightOption, 
  updateBagWeightOption, 
  deleteBagWeightOption, 
  setDefaultBagWeightOption,
  formatBagWeightOptions 
} from '../../services/bagWeightOptionService';

const BagWeightOptionsManager = ({ isOpen, onClose }) => {
  const { currentBranchId } = useSelector((state) => state.branch);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formData, setFormData] = useState({
    weight: '',
    label: '',
    isDefault: false
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load bag weight options
  const loadOptions = async () => {
    if (!currentBranchId) return;
    
    setLoading(true);
    try {
      const response = await getBagWeightOptions(currentBranchId);
      if (response.success) {
        const formattedOptions = formatBagWeightOptions(response.data);
        setOptions(formattedOptions);
      }
    } catch (error) {
      console.error('Error loading bag weight options:', error);
      setError('Failed to load bag weight options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen, currentBranchId]);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openCreateModal = () => {
    setFormData({
      weight: '',
      label: '',
      isDefault: false
    });
    setEditingOption(null);
    setShowCreateModal(true);
  };

  const openEditModal = (option) => {
    setFormData({
      weight: option.value,
      label: option.label,
      isDefault: option.isDefault
    });
    setEditingOption(option);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingOption(null);
    setFormData({
      weight: '',
      label: '',
      isDefault: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight < 1 || weight > 100) {
        throw new Error('Weight must be between 1 and 100 kg');
      }

      const data = {
        weight,
        label: formData.label || `${weight} kg`,
        isDefault: formData.isDefault
      };

      if (editingOption) {
        await updateBagWeightOption(editingOption.id, data);
        setSuccessMessage('Bag weight option updated successfully');
      } else {
        await createBagWeightOption(data);
        setSuccessMessage('Bag weight option created successfully');
      }

      closeModal();
      loadOptions();
    } catch (error) {
      setError(error.message || 'Failed to save bag weight option');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (optionId) => {
    if (!window.confirm('Are you sure you want to delete this bag weight option?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteBagWeightOption(optionId);
      setSuccessMessage('Bag weight option deleted successfully');
      loadOptions();
    } catch (error) {
      setError(error.message || 'Failed to delete bag weight option');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (optionId) => {
    setLoading(true);
    try {
      await setDefaultBagWeightOption(optionId);
      setSuccessMessage('Default bag weight option set successfully');
      loadOptions();
    } catch (error) {
      setError(error.message || 'Failed to set default bag weight option');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogBox
        title="Bag Weight Options Management"
        show={isOpen}
        onClose={onClose}
        size="2xl"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Bag Weight Options
            </h3>
            <Button
              onClick={openCreateModal}
              variant="primary"
              icon="add"
              disabled={loading}
            >
              Add New Option
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">{successMessage}</div>
            </div>
          )}

          {/* Options List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {options.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No bag weight options found. Create your first option!
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      option.isDefault ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.isDefault && (
                          <div className="text-xs text-blue-600 font-medium">
                            Default Option
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!option.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(option.id)}
                          variant="secondary"
                          size="sm"
                          icon="check"
                          disabled={loading}
                        >
                          Set Default
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => openEditModal(option)}
                        variant="secondary"
                        size="sm"
                        icon="edit"
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(option.id)}
                        variant="danger"
                        size="sm"
                        icon="delete"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogBox>

      {/* Create/Edit Modal */}
      <DialogBox
        title={editingOption ? "Edit Bag Weight Option" : "Add New Bag Weight Option"}
        show={showCreateModal}
        onClose={closeModal}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Weight (kg)"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleInputChange}
            required
            min="1"
            max="100"
            step="0.1"
            placeholder="e.g., 50"
          />

          <FormInput
            label="Label"
            name="label"
            type="text"
            value={formData.label}
            onChange={handleInputChange}
            placeholder="e.g., 50 kg (Standard)"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default option
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={closeModal}
              variant="secondary"
              icon="close"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon="save"
              disabled={loading}
            >
              {editingOption ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogBox>
    </>
  );
};

export default BagWeightOptionsManager; 