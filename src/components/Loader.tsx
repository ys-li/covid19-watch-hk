import '../assets/scss/app.scss'
import React from 'react';

/**
 * Custom Loader that look likes a droplet
 */
const Loader = (props: LoadingProps) => (
    <div className={props.wrap ? `wrap` : ''}>
        <div className="loading">
            <div className="bounceball"></div>
        </div>
    </div>
);

interface LoadingProps {
    wrap?: boolean;
}

export default Loader;