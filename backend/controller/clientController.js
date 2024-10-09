const client = require("../models/clientModels");
const contact = require("../models/contactModels");
const lead = require("../models/leadModels");

exports.createClient = async (req, res) => {
    try {
        const { name, company, phone, email, location} = req.body;
        if(!name || !company || !phone || !email || !location){
            return res.status(400).json({ message: "All fields are required" });
        }
        if(await client.findOne({email})){
            return res.status(400).json({ message: "Client email already exists" });
        }
        if(await client.findOne({phone})){
            return res.status(400).json({ message: "Client phone no. already exists" });
        }
        const clientContact = await contact.findOne({phoneNo : phone, email});
        if(!clientContact){
            await contact.create({contactName: name, companyName: company, phoneNo: phone, email});
        }
        console.log({ name, company, phone, email, location})
        const newClient = await client.create({name, company, phone, email, location});
        res.status(201).json(newClient);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.createClientByLead = async (req, res) => {
    try {
        const {leadId} = req.params;
        const leadData = await lead.findById(leadId);
        if(!leadData){
            return res.status(404).json({ error: "Lead not found" });
        }
        const newClient = await client.create({name: leadData.contactName, company: leadData.companyName, phone: leadData.phone, email: leadData.email, location: leadData.location});
        res.status(201).json(newClient);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAllClients = async (req, res) => {
    try {
        const clients = await client.find();
        res.status(200).json(clients);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const clientData = await client.findById(id);
        if (!clientData) {
            return res.status(404).json({ error: "Client not found" });
        }
        res.status(200).json(clientData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, company, phone, email, location } = req.body;
        const clientData = await client.findById(id);
        if (!clientData) {
            return res.status(404).json({ error: "Client not found" });
        }
        if(phone && (await client.findOne({phone}))){
            return res.status(400).json({ error: "Client phone no. already exists" });
        }
        if(email && (await client.findOne({email}))){
            return res.status(400).json({ error: "Client email already exists" });
        }
        if(phone || email){
            const clientContact = await contact.findOne({phone: clientData.phone, email: clientData.email});
            clientContact.contactName = name || clientContact.contactName;
            clientContact.companyName = company || clientContact.companyName;
            clientContact.phone = phone || clientContact.phone;
            clientContact.email = email || clientContact.email;
            await clientContact.save();
        }
        clientData.name = name || clientData.name;
        clientData.company = company || clientData.company;
        clientData.phone = phone || clientData.phone;
        clientData.email = email || clientData.email;
        clientData.location = location || clientData.location;
        await clientData.save();
        res.status(200).json(clientData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};





// not completed
exports.getAllDataOfClient = async (req, res) => {
    try {
        const { id } = req.params;
        const clientData = await client.findById(id);
        if(!clientData){
            return res.status(404).json({ error: "Client not found" });
        }
        clientData.projects = await project.find({clientId: id}).populate("teamIds lastMeetingId");
        clientData.projects.forEach(async (project) => {
            project.meetings = await meeting.find({projectId: project._id, clientId: clientData._id});
        });
        res.status(200).json({clientData});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
