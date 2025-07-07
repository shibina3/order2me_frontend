import React, { useEffect, useState } from 'react'

export default function ManagePromoCodes(props) {
    const [loading, setLoading] = useState(true);
    const [promoCodes, setPromoCodes] = useState([]);
    const [code, setCode] = useState('');
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [search, setSearch] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discount_type, setDiscountType] = useState('amount');

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: "/get/promo-codes" }),
            });
            const data = await response.json();
            const fetchedCodes = JSON.parse(data.body);
            setPromoCodes(fetchedCodes);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    const handleAddPromoCode = async () => {
        if (discount === 0 || !code.length) {
            alert('Please enter code and discount');
            return;
        }
        try {
            const response = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, discount, discount_type, path: "/add/promo-code" }),
            });
            const result = await response.json();
            if (result.message === 'Promo code added successfully') {
                let updatedCodes = [...promoCodes];
                updatedCodes.push({ id: result.id, code, discount, discount_type });
                setPromoCodes(updatedCodes);
                setCode('');
                setDiscount(0);
                setSelectedCodes([]);
            } else {
                alert('Failed to add promo code');
            }
        } catch (error) {
            console.error("Error adding promo code:", error);
        }
    }

    const handleDeletePromoCode = async () => {
        if (selectedCodes.length === 0) {
            alert('Please select promo code to delete');
            return;
        }
        try {
            const response = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ codeIds: selectedCodes, path: "/delete/promo-code" }),
            });
            const result = await response.json();
            if (result.message === 'Promo code deleted successfully') {
                let updatedCodes = [...promoCodes];
                updatedCodes = updatedCodes.filter((promo) => !selectedCodes.includes(promo.id));
                setPromoCodes(updatedCodes);
                setSelectedCodes([]);
            } else {
                alert('Failed to delete promo code');
            }
        } catch (error) {
            console.error("Error deleting promo code:", error);
        }
    }

    return (
        <div className="manage-details">
            <nav aria-label="breadcrumb" className="breadcrumb-container">
                <ol className="breadcrumb d-flex">
                    <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
                        / Admin
                    </li>
                    <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
                        Manage Promo Codes
                    </li>
                </ol>
            </nav>

            {loading && <p>Loading promo codes...</p>}

            <div className="form-group">
                <label htmlFor="code">Enter a promo code:</label>
                <input type="text" className="form-control" id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <label htmlFor="discount_type">Choose Discount Type</label>
                <select className="form-select mt-2" value={discount_type} onChange={(e) => setDiscountType(e.target.value)} id='discount_type'>
                    <option className='form-select' value="amount">Amount</option>
                    <option className='form-select' value="percentage">Percentage</option>
                </select>
                <input type="number" className="form-control mt-2" id="amount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                <button className="btn btn-warning" disabled={!code.length} onClick={handleAddPromoCode}>Add Promo Code</button>
                <button className="btn btn-danger" disabled={!selectedCodes.length} onClick={handleDeletePromoCode}>Delete</button>
            </div>

            {!loading && promoCodes.length > 0 && (
                <div>
                    <div className="wallet-form">
                        {/* <div className="form-group">
                        <label htmlFor="amount">Enter a promo code:</label>
                        <input type="number" className="form-control" id="amount" value={code} onChange={(e) => setCode(e.target.value)} />
                        <select className="form-select mt-2" value={discount_type} onChange={(e) => setDiscountType(e.target.value)}>
                            <option value="amount">Amount</option>
                            <option value="percentage">Percentage</option>
                        </select>
                        <input type="number" className="form-control mt-2" id="amount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                        <button className="btn btn-warning" disabled={!code.length} onClick={handleAddPromoCode}>Add Promo Code</button>
                        <button className="btn btn-danger" disabled={!selectedCodes.length} onClick={handleDeletePromoCode}>Delete</button>
                    </div> */}
                        {/* checkbox for users */}
                        <div className="form-group mt-3">
                            <input type="checkbox" id="select-all" onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedCodes(promoCodes.map((promo) => promo.id));
                                } else {
                                    setSelectedCodes([]);
                                }
                            }
                            } />
                            <label className='ms-2' htmlFor="select-all">Select All</label>
                            {/* search bar */}
                            <input type="text" className="form-control mt-2" placeholder="Search code" onChange={(e) => setSearch(e.target.value)} />
                            {promoCodes.filter(promo => {
                                if (!search) return promo;
                                return promo.code.toLowerCase().includes(search.toLowerCase());
                            }).map((promo) => (
                                <div key={promo.id} className='my-2'>
                                    <input type="checkbox" checked={selectedCodes.includes(promo.id)} id={promo.id} onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCodes([...selectedCodes, promo.id]);
                                        } else {
                                            setSelectedCodes(selectedCodes.filter((selectedCode) => selectedCode !== promo.id));
                                        }
                                    }} />
                                    <label className="form-check-label ms-2" htmlFor={promo.id}>{promo.code} - {promo.discount_type === 'amount' ? 'Rs ' : ''}{promo.discount}{promo.discount_type === 'percentage' ? '%' : ''} OFF</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
