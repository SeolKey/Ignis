import React from "react"
import '../styles/Container.css'

const Container = ({Layout}) => {
  return (
    <div className="conatiner">
      {Layout}
    </div>
  );
};

export default Container