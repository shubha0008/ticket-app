import React, { useState, useEffect } from "react";

const Header = ({ view, setView }) => {
  return (
    <div>
      <button
        onClick={(_) => setView("contacts")}
        style={view === "contacts" ? { color: "red" } : {}}
      >
        Contacts
      </button>
      <button
        onClick={(_) => setView("agents")}
        style={view === "agents" ? { color: "red" } : {}}
      >
        Agents
      </button>
      <button
        onClick={(_) => setView("tickets")}
        style={view === "tickets" ? { color: "red" } : {}}
      >
        Tickets
      </button>
      <button
        onClick={(_) => setView("setup")}
        style={view === "setup" ? { color: "red" } : {}}
      >
        Setup
      </button>
    </div>
  );
};

const App = (props) => {
  const [view, setView] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:4040/agents").then((res) => res.json()),
      fetch("http://localhost:4040/customers").then((res) => res.json()),
      fetch("http://localhost:4040/tickets").then((res) => res.json()),
    ])
      .then(([agent, contact, ticket]) => {
        setTickets(ticket);
        setAgents(agent);
        setContacts(contact);
      })
      .catch(() => setView("Error"));
  }, []);

  const saveTicket = (data) =>
    fetch("http://localhost:4040/tickets", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        setTickets((data) => data.concat([res]));
        return res;
      });

  return (
    <div>
      <Header view={view} setView={setView} />
      {view === "tickets" && (
        <Tickets
          tickets={tickets}
          agents={agents}
          contacts={contacts}
          saveTicket={saveTicket}
        />
      )}

      {view === "agents" && <h1>agents</h1>}
      {view === "contacts" && "contact"}
      {view === "Error" && <h1>Oopsss something went wrong</h1>}
    </div>
  );
};

const Tickets = ({ tickets, agents, contacts, saveTicket }) => {
  const [view, setView] = useState("VIEW");

  const findAgent = (id) => agents.find((agent) => agent.id === id);
  const findContact = (id) => contacts.find((contact) => contact.id === id);

  const onSave = (event) => {
    event.preventDefault();

    const status = event.target.status.value;
    const subject = event.target.suject.value;
    const agentID = event.target.agents.value;
    const contactID = event.target.contacts.value;

    const data = { subject, status, agentID, contactID };

    saveTicket(data).then(() => {
      setView("VIEW");
    });
  };

  return (
    <div>
      <button onClick={(_) => setView("NEW")}>Create Contact</button>
      {view === "NEW" && (
        <div>
          <button onClick={(_) => setView("VIEW")}>Cancel</button>
          <form onSubmit={onSave}>
            <label for="subject">Subject</label>
            <br />
            <input type="text" id="suject" name="subject" />
            <br />
            <label for="status">Status:</label>
            <br />
            <input
              type="radio"
              id="status"
              name="status"
              value="open"
            /> Open <br />
            <input type="radio" id="status" name="status" value="pending" />
            Pending <br />
            <input type="radio" id="status" name="status" value="closed" />
            Close <br />
            <br />
            <br />
            <label for="agent">Agent:</label>
            <br/>
            {agents.map(({ id, name }) => (
              <div>
                <input type="radio" id="agents" name="agents" value={id} />{" "}
                {name} <br />
              </div>
            ))}
            <label for="contacts">Contacts:</label>
            <br />
            {contacts.map(({ id, name }) => (
              <div>
                <input type="radio" id="contacts" name="contacts" value={id} />{" "}
                {name} <br />
              </div>
            ))}
            <input type="submit" value="Submit" />
          </form>
        </div>
      )}

      {view === "VIEW" && (
        <table>
          <tr>
            <th>Subject</th>
            <th>Status</th>
            <th>Agent</th>
            <th>Contact</th>
          </tr>
          {tickets.map(({ id, subject, status, agentID, contactID }) => (
            <tr key={id} style={{ border: "1px solid blacks" }}>
              <td>{subject}</td>
              <td>{status}</td>
              <td>{findAgent(agentID) ? findAgent(agentID).name : "Oopps"} </td>
              <td>
                {findContact(contactID) ? findContact(contactID).name : "Oopps"}
              </td>
            </tr>
          ))}
        </table>
      )}
    </div>
  );
};

export default App;
