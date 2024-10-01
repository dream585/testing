import React, { useRef, useState, useEffect } from "react";
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

const KonvaCanvas = () => {
  const [rectangles, setRectangles] = useState([]);
  const [text, setText] = useState("");
  const [saveName, setSaveName] = useState("");
  const [rect, setRect] = useState(null);
  const [currentRectIndex, setCurrentRectIndex] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [image, status] = useImage(imageFile); // Add status to track load state
  const fileInputRef = useRef();
  const [showKonvaContainer, setShowKonvaContainer] = useState(false); // Visibility state
  const [showUploadButton, setShowUploadButton] = useState(true); // Upload button visibility state
  const [showNmberInputModal, setShowNmberInputModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === "loaded") {
      setShowKonvaContainer(true);
      setShowUploadButton(false);
    }
  }, [status]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    const { x, y } = e.target.getStage().getPointerPosition();

    // Check if clicking on an existing rectangle
    const clickedOnRect = rectangles.some(
      (rect) =>
        x >= rect.rect.x &&
        x <= rect.rect.x + rect.rect.width &&
        y >= rect.rect.y &&
        y <= rect.rect.y + rect.rect.height
    );

    console.log(clickedOnRect);

    if (!clickedOnRect) {
      setRect({ x, y, width: 0, height: 0 });
      setDrawing(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const stage = e.target.getStage();
    let { x, y } = stage.getPointerPosition();

    rectangles.forEach((existingRect) => {
      if (
        x >= existingRect.rect.x &&
        x <= existingRect.rect.x + existingRect.rect.width &&
        y >= existingRect.rect.y &&
        y <= existingRect.rect.y + existingRect.rect.height
      ) {
        // Clamp x to the left edge of the existing rectangle
        if (x > existingRect.rect.x) {
          x = existingRect.rect.x;
        }
        // Clamp y to the top edge of the existing rectangle
        if (y > existingRect.rect.y) {
          y = existingRect.rect.y;
        }
      }
    });

    setRect((prevRect) => ({
      ...prevRect,
      width: x - prevRect.x,
      height: y - prevRect.y,
    }));
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    setDrawing(false);
    setShowNmberInputModal(true);
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleSaveModalChange = (e) => {
    setSaveName(e.target.value);
  };

  const handleModalButtonClick = () => {
    if (currentRectIndex === null) {
      const rectangle = {
        rect: rect,
        text: text,
      };
      setRectangles((prevRectangles) => [...prevRectangles, rectangle]);
    } else {
      let updatedRectangles = [];
      rectangles.map((rectangle, index) => {
        if (index === currentRectIndex) {
          const newRectangle = {
            rect: rectangle.rect,
            text: text,
          };
          updatedRectangles.push(newRectangle);
        } else {
          updatedRectangles.push(rectangle);
        }
      });

      setRectangles(updatedRectangles);
    }
    setRect(null);
    setText("");
    setShowNmberInputModal(false);
    setCurrentRectIndex(null);
  };

  const handleSaveModalButtonClick = () => {
    const data = JSON.stringify({
      image: image,
      rectangles: rectangles
    });
    localStorage.setItem(saveName, data);
    setShowSaveModal(false);
  };

  const handleRectDoubleClick = (index) => {
    setCurrentRectIndex(index);
    setShowNmberInputModal(true);
  };

  const handleDragEnd = (e, selectedIndex) => {
    const { x, y } = e.target.position();
    let updatedRectangles = [];
    rectangles.map((rectangle, index) => {
      if (index === selectedIndex) {
        const newRectangle = {
          rect: rectangle.rect,
          text: rectangle.text,
        };
        newRectangle.rect.x = x;
        newRectangle.rect.y = y;
        updatedRectangles.push(newRectangle);
      } else {
        updatedRectangles.push(rectangle);
      }
    });
    setRectangles(updatedRectangles);
    console.log(rectangles);
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div>
      {showUploadButton && (
        <>
          <input
            type="file"
            id="fileInput"
            className="file-input"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          <label htmlFor="fileInput" id="fileLabel" className="file-label">
            <i className="fa fa-plus me-2"></i> Upload Image
          </label>
        </>
      )}
      {showKonvaContainer && (
        <div id="konvaContainer">
          <Stage
            width={image ? image.width : window.innerWidth}
            height={image ? image.height : window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
              {rect && (
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  stroke="black"
                  strokeWidth={2}
                  fill="white"
                />
              )}
            </Layer>
          </Stage>
        </div>
      )}

      {showNmberInputModal && (
        <>
          <div className="modal-overlay"></div>
          <div className="modal" style={{width: "300px", height: "150px"}}>
            <input
              type="text"
              onChange={handleChange}
              placeholder="Enter Position Number"
            />
            <button onClick={handleModalButtonClick}>OK</button>
          </div>
        </>
      )}

      {showSaveModal && (
        <>
          <div className="modal-overlay"></div>
          <div className="modal" style={{width: "300px", height: "150px"}}>
            <input
              type="text"
              onChange={handleSaveModalChange}
              placeholder="Enter Name"
            />
            <button onClick={handleSaveModalButtonClick}>OK</button>
          </div>
        </>
      )}
      {rectangles.length > 0 && (
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
      )}

      {showUploadButton === false && (
        <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}>
          <input
            type="file"
            id="file_update"
            className="file-input"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          <label htmlFor="file_update" id="fileUpdateLabel" className="file-label">
            <i className="fa fa-edit"></i> 
          </label>
        </div>
      )}
    </div>
  );
};

export default KonvaCanvas;
