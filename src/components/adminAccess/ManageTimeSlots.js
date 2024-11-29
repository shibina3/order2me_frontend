import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Form, InputGroup } from 'react-bootstrap';

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
        const getTSRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({path: "/get/time_slots" }),
          });
        let getTSData = await getTSRes.json();
        getTSData = JSON.parse(getTSData?.body || []);
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
    const addtimeSlotRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({path: "/add/time_slot", time_slot: newtimeSlot }),
    });
    let addtimeSlotData = await addtimeSlotRes.json();
    let updatedTimeSlots = JSON.parse(addtimeSlotData.body);
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
    const deleteTSRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, path: "/delete/time_slot" }),
    });
    let deleteTSData = await deleteTSRes.json();
    let updatedTS = JSON.parse(deleteTSData.body);
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
