// DayMap.js
import React, { useState } from "react";
import dynamic from "next/dynamic";
import useImage from "use-image";

const Stage = dynamic(() => import("react-konva").then((mod) => mod.Stage), {
    ssr: false,
  });
  
  const Layer = dynamic(() => import("react-konva").then((mod) => mod.Layer), {
    ssr: false,
  });
  
  const Rect = dynamic(() => import("react-konva").then((mod) => mod.Rect), {
    ssr: false,
  });
  
  const Text = dynamic(() => import("react-konva").then((mod) => mod.Text), {
    ssr: false,
  });
  
  const Group = dynamic(() => import("react-konva").then((mod) => mod.Group), {
    ssr: false,
  });
  
  const KonvaImage = dynamic(
    () => import("react-konva").then((mod) => mod.Image),
    { ssr: false }
  );

const DayMap = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadButtonShow, setIsLoadButtonShow] = useState(true);
  const [localStorageItems, setLocalStorageItems] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [image, status] = useImage(imageFile); // Add status to track load state
  const [rectangles, setRectangles] = useState([]);

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

  return (
    <div>
        {!isLoadButtonShow && !isModalOpen && (status === 'loaded') && (
            <div id="konvaContainer">
            <Stage
              width={image ? image.width : window.innerWidth}
              height={image ? image.height : window.innerHeight}
            >
              <Layer>
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
                    draggable={true}
                    onDragStart={(e) => {
                      setDrawing(false);
                      console.log(e.target.x());
                    }}
                    onDragEnd={(e) => {
                      handleDragEnd(e, index);
                      console.log(e.target.x());
                    }}
                    onDblClick={() => handleRectDoubleClick(index)}
                  >
                    <Rect
                    x={0}
                    y={0}
                      width={rectangle.rect.width}
                      height={rectangle.rect.height}
                      stroke="black"
                      strokeWidth={2}
                      fill="white"
                    />
                    <Text
                      x={
                        rectangle.rect.width / 2 - rectangle.text.length * 4.2
                      }
                      y={
                        rectangle.rect.height / 2 - 8
                      }
                      text={rectangle.text}
                      fontSize={16}
                      fontStyle="bold"
                      fill="black"
                    />
                  </Group>
                ))}
              </Layer>
            </Stage>
          </div>
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
    </div>
  );
};

export default DayMap;
