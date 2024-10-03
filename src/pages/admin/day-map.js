import React, { useState, useEffect, useRef } from "react";
// import dynamic from "next/dynamic";
import useImage from "use-image";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Image as KonvaImage,
} from "react-konva";

const DayMap = () => {
  const names = ["Alice", "Bob", "Jane", "John"];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadButtonShow, setIsLoadButtonShow] = useState(true);
  const [localStorageItems, setLocalStorageItems] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [image, status] = useImage(imageFile);
  const [rectangles, setRectangles] = useState([]);
  const [textRemoveRectangleIndex, setTextRemoveRectangleIndex] =
    useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const stageRef = useRef(null);
  const layerRef = useRef(null);

  const loadTemplate = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== "ally-supports-cache") {
        const value = localStorage.getItem(key);
        items.push({ key, value });
      }
    }
    setLocalStorageItems(items);
    setIsModalOpen(true);
    setIsLoadButtonShow(false);
  };

  const handleLocalStorageItemSelection = (index) => {
    const data = JSON.parse(localStorageItems[index].value);
    setImageFile(data.image);
    setRectangles(data.rectangles);
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData("nameIndex", index);
  };

  const handleNameDragStart = (event, rectangleIndex) => {
    setTextRemoveRectangleIndex(rectangleIndex);
  };

  const handleNameDragEnd = (event, groupPosition, draggedName) => {
    const targetPosition = event.target.position();
    const x = targetPosition.x + groupPosition.x;
    const y = targetPosition.y + groupPosition.y;
    let updatedRectangles = [];
    rectangles.map((rectangle, index) => {
      if (
        x >= rectangle.rect.x &&
        x <= rectangle.rect.x + rectangle.rect.width &&
        y >= rectangle.rect.y &&
        y <= rectangle.rect.y + rectangle.rect.height
      ) {
        const newX = rectangle.rect.width / 2 - draggedName.length * 3.2;
        const newY = rectangle.rect.height / 2 + 8;
        updatedRectangles.push({
          rect: rectangle.rect,
          text: rectangle.text,
          name: {
            position: { x: newX, y: newY },
            group_position: { x: rectangle.rect.x, y: rectangle.rect.y },
            text: draggedName,
          },
        });
      } else {
        if (index === textRemoveRectangleIndex) {
          updatedRectangles.push({
            rect: rectangle.rect,
            text: rectangle.text,
          });
        } else updatedRectangles.push(rectangle);
      }
    });
    setRectangles(updatedRectangles);
  };

  const handleDrop = (event) => {
    console.log("drop triggered");
    event.preventDefault();
    const nameIndex = event.dataTransfer.getData("nameIndex");
    const draggedName = names[nameIndex];

    if (!stageRef.current) {
      return;
    }
    stageRef.current.setPointersPositions(event);
    let { x, y } = stageRef.current.getPointerPosition();
    let updatedRectangles = [];
    rectangles.map((rectangle, index) => {
      if (
        x >= rectangle.rect.x &&
        x <= rectangle.rect.x + rectangle.rect.width &&
        y >= rectangle.rect.y &&
        y <= rectangle.rect.y + rectangle.rect.height
      ) {
        x = rectangle.rect.width / 2 - draggedName.length * 3.2;
        y = rectangle.rect.height / 2 + 8;
        updatedRectangles.push({
          rect: rectangle.rect,
          text: rectangle.text,
          name: {
            position: { x, y },
            group_position: { x: rectangle.rect.x, y: rectangle.rect.y },
            text: draggedName,
          },
        });
      } else {
        updatedRectangles.push(rectangle);
      }
    });
    setRectangles(updatedRectangles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDbClick = (rectangleIndex) => {
    let updatedRectangles = [];
    rectangles.map((rectangle, index) => {
      if (index === rectangleIndex) {
        updatedRectangles.push({
          rect: rectangle.rect,
          text: rectangle.text,
        });
      } else updatedRectangles.push(rectangle);
    });
    setRectangles(updatedRectangles);
  };

  const handleSaveModalChange = (e) => {
    setSaveName(e.target.value);
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleSaveModalButtonClick = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === saveName) {
        alert("This same name is existed in localstorage!");
        return;
      }
    }
    const data = JSON.stringify({
      image: imageFile,
      rectangles: rectangles,
    });
    sessionStorage.setItem(saveName, data);
    setShowSaveModal(false);
  };

  const handleDownload = () => {
    const data = JSON.stringify({
      image: imageFile,
      rectangles: rectangles,
    });

    const blob = new Blob([data], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "myedit.json"; // The file name
    document.body.appendChild(a);
    a.click();

    // Cleanup: Remove the link after download
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex" }}>
      {!isLoadButtonShow && !isModalOpen && status === "loaded" && (
        <>
          <div className="left-bar">
            {names.map((name, index) => (
              <div
                key={index}
                className="name"
                draggable="true"
                onDragStart={(event) => handleDragStart(event, index)}
              >
                {name}
              </div>
            ))}
            <div className="legend-container">
              <h4>Legend</h4>
              {rectangles.map((rectangle, index) => (
                <div className="legend" key={index}>
                  <div>
                    <span className="fw-bold">Square Name: </span>
                    <span>{rectangle.text}</span>
                  </div>
                  {rectangle.name && (
                    <div>
                      <span className="fw-bold">Assigned Name: </span>
                      <span>{rectangle.name.text}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div
            id="konvaContainer"
            className="day-map-container"
            onDrop={(event) => handleDrop(event)}
            onDragOver={(event) => handleDragOver(event)}
          >
            <Stage
              ref={stageRef}
              width={image ? image.width : window.innerWidth}
              height={image ? image.height : window.innerHeight}
            >
              <Layer ref={layerRef}>
                <KonvaImage
                  image={image}
                  x={0}
                  y={0}
                  width={image.width}
                  height={image.height}
                />
                {rectangles.map((rectangle, index) => (
                  <Group
                    key={index}
                    x={rectangle.rect.x}
                    y={rectangle.rect.y}
                    onDrop={(event) => handleDrop(event, index)}
                    onDragOver={handleDragOver}
                    onDblClick={() => handleDbClick(index)}
                  >
                    <Rect
                      x={0}
                      y={0}
                      width={rectangle.rect.width}
                      height={rectangle.rect.height}
                      stroke="black"
                      strokeWidth={2}
                      fill={rectangle.name ? "cyan" : "white"}
                    />
                    <Text
                      x={rectangle.rect.width / 2 - rectangle.text.length * 4.2}
                      y={rectangle.rect.height / 2 - 8}
                      text={rectangle.text}
                      fontSize={16}
                      fontStyle="bold"
                      fill="black"
                    />
                    {rectangle.name && (
                      <Text
                        x={rectangle.name.position.x}
                        y={rectangle.name.position.y}
                        text={rectangle.name.text}
                        fontSize={14}
                        fontStyle="bold"
                        fill="black"
                        draggable={true}
                        onDragStart={(e) => handleNameDragStart(e, index)}
                        onDragEnd={(e) =>
                          handleNameDragEnd(
                            e,
                            rectangle.name.group_position,
                            rectangle.name.text
                          )
                        }
                      />
                    )}
                  </Group>
                ))}
              </Layer>
            </Stage>
          </div>
        </>
      )}

      {isLoadButtonShow && (
        <button className="load-button" onClick={loadTemplate}>
          <i className="fa fa-download me-2"></i>Load Template
        </button>
      )}

      {isModalOpen && (
        <>
          <div className="modal-overlay"></div>
          <div className="modal">
            <h2>Local Storage Items</h2>
            <ul className="styled-list">
              {localStorageItems.map((item, index) => (
                <li
                  key={index}
                  className="list-item"
                  onClick={() => handleLocalStorageItemSelection(index)}
                >
                  {`${item.key}`}
                </li>
              ))}
            </ul>
            <button onClick={closeModal}>Close</button>
          </div>
        </>
      )}

      {showSaveModal && (
        <>
          <div className="modal-overlay"></div>
          <div className="modal" style={{ width: "300px", height: "150px" }}>
            <input
              type="text"
              onChange={handleSaveModalChange}
              placeholder="Enter Name"
            />
            <button onClick={handleSaveModalButtonClick}>OK</button>
          </div>
        </>
      )}
      {!isLoadButtonShow && !isModalOpen && status === "loaded" && (
        <>
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1000,
            }}
          >
            <button className="save-button" onClick={handleSave}>
              <i className="fa fa-save"></i>
            </button>
          </div>

          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 1000,
            }}
          >
            <button className="save-button" onClick={handleDownload}>
              <i className="fa fa-download"></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DayMap;
