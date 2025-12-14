import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Form, InputGroup } from 'react-bootstrap';
import { apiCall } from '../../config';

const ManageTimeSlots = (props) => {
  const [timeSlots, setTimeSlots] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showAddTimeSlotForm, setShowAddTimeSlotForm] = useState(false);
  const [newtimeSlot, setNewtimeSlot] = useState({
    from: '',
    to: ''
  }); 

  const setPage = (page) => {
    props.setActivePage(page);
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = () => {
    setTimeout(async () => {
        const getTSRes = await apiCall('/get/time_slots');
        let getTSData = getTSRes.body || [];
        getTSData = getTSData.sort((a, b) => a.from_time.localeCompare(b.from_time));
        setTimeSlots(getTSData);
        setLoading(false);
    }, 1000); 
  };

  const handleAddTimeSlot = async () => {
    if (!newtimeSlot.from || !newtimeSlot.to) {
      alert('Please enter a time slot');
      return;
    }
    const addtimeSlotData = await apiCall('/add/time_slot', {
      body: { time_slot: newtimeSlot }
    });
    let updatedTimeSlots = addtimeSlotData.body || [];
    updatedTimeSlots = updatedTimeSlots.sort((a, b) => a.from_time.localeCompare(b.from_time));
    if (addtimeSlotData.message === "Time Slot Added") {
      setTimeSlots(updatedTimeSlots);
      setNewtimeSlot({
        from: '',
        to: ''
      }); 
      setShowAddTimeSlotForm(false);
    }
  };

  const handleDeleteTimeSlot = async (id) => {
    const deleteTSData = await apiCall('/delete/time_slot', {
      body: { id: id }
    });
    let updatedTS = deleteTSData.body || [];
    updatedTS = updatedTS.sort((a, b) => a.from_time.localeCompare(b.from_time));
    if (deleteTSData.message === "Time Slot Deleted") {
      setTimeSlots(updatedTS);
    }
  };

  return (
    <div className="manage-locations">
      <nav aria-label="breadcrumb" className="breadcrumb-container">
        <ol className="breadcrumb d-flex">
          <li 
            className="breadcrumb-item active" 
            aria-current="page" 
            onClick={() => { setPage('admin'); }} 
          >
            / Admin
          </li>
          <li 
            className="breadcrumb-item active breadcrumb-secondary" 
            aria-current="page"
          >
            Manage Time Slots
          </li>
        </ol>
      </nav>

      <Button
        variant="success"
        onClick={() => setShowAddTimeSlotForm(!showAddTimeSlotForm)}
        className="mb-3 mt-4"
      >
        {showAddTimeSlotForm ? 'Cancel' : '+ Add New Time Slot'}
      </Button>

      {showAddTimeSlotForm && (
        <InputGroup className="mb-3 align-items-center gap-4">
            <Form.Label>From</Form.Label>
            <Form.Control
                type="time"
                value={newtimeSlot.from}
                onChange={(e) => setNewtimeSlot({ ...newtimeSlot, from: e.target.value })}
            />
            <Form.Label>To</Form.Label>
            <Form.Control
                type="time"
                value={newtimeSlot.to}
                onChange={(e) => setNewtimeSlot({ ...newtimeSlot, to: e.target.value })}
            />
            <Button variant='secondary' style={{backgroundColor: '#0d6efd'}} onClick={handleAddTimeSlot} className='mt-0'>
                Add
            </Button>
        </InputGroup>
      )}

      {loading && <p>Loading timeSlots...</p>}

      {timeSlots.length === 0 && !loading && (
        <p>No time slots found. Click on "Add" to add a new time slot.</p>
      )}

      {timeSlots.length > 0 && (
        <ListGroup>
          {timeSlots.map((timeSlot) => (
            <ListGroup.Item key={timeSlot.id} className="d-flex justify-content-between align-items-center">
              FROM - {timeSlot.from_time} TO - {timeSlot.to_time}
              <div>
                <Button variant="danger" onClick={() => handleDeleteTimeSlot(timeSlot.id)}>
                  Delete
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default ManageTimeSlots;
