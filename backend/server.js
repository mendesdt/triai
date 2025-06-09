const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection
const mongoUrl = 'mongodb+srv://guilherme:xdyyAdbBM3YkQKCm@cluster0.l2eedl4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'healthcare-triage';

let db;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB and setup routes after connection
MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    
    // Routes - moved inside the connection block to ensure db is available

    // Get all patients in queue
    app.get('/api/patients', async (req, res) => {
      try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const patients = await db.collection('pacientesNaFila')
          .find(filter)
          .sort({ createdAt: 1 })
          .toArray();
        
        // Convert MongoDB _id to id for frontend compatibility
        const formattedPatients = patients.map(patient => ({
          ...patient,
          id: patient._id.toString(),
          _id: undefined
        }));
        
        res.json(formattedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
      }
    });

    // Add new patient to queue
    app.post('/api/patients', async (req, res) => {
      try {
        const patientData = {
          ...req.body,
          createdAt: new Date(),
          status: req.body.status || 'waiting'
        };
        
        const result = await db.collection('pacientesNaFila').insertOne(patientData);
        
        res.json({
          id: result.insertedId.toString(),
          ...patientData
        });
      } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ error: 'Failed to add patient' });
      }
    });

    // Update patient data
    app.put('/api/patients/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body };
        delete updateData.id; // Remove id from update data
        
        const result = await db.collection('pacientesNaFila').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Failed to update patient' });
      }
    });

    // Update patient status
    app.patch('/api/patients/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await db.collection('pacientesNaFila').updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error updating patient status:', error);
        res.status(500).json({ error: 'Failed to update patient status' });
      }
    });

    // Remove patient from queue
    app.delete('/api/patients/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        const result = await db.collection('pacientesNaFila').deleteOne(
          { _id: new ObjectId(id) }
        );
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error removing patient:', error);
        res.status(500).json({ error: 'Failed to remove patient' });
      }
    });

    // Start server only after database connection is established
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });