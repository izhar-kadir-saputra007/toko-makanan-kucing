// ChartCard.jsx
import React from "react";
import { Card, Nav } from "react-bootstrap";

const ChartCard = React.memo(({ title, activeTab, setActiveTab, ChartComponent }) => {
  console.log(`Rendering ${title}`); // Untuk debugging

  return (
    <Card>
      <Card.Header className="bg-primary text-white">
        <h4 className="text-center">{title}</h4>
      </Card.Header>
      <Card.Body>
        <Nav
          variant="tabs"
          className="mb-4"
          onSelect={(selectedKey) => setActiveTab(selectedKey)}
        >
          <Nav.Item>
            <Nav.Link eventKey="line" active={activeTab === "line"}>
              Line Chart
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="bar" active={activeTab === "bar"}>
              Bar Chart
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <ChartComponent activeTab={activeTab} />
      </Card.Body>
    </Card>
  );
});

ChartCard.displayName = 'ChartCard';


export default ChartCard;