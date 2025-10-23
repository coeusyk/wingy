"""Logging configuration for Wingy.""""""Logging setup for Wingy."""



import loggingimport logging

import sysimport sys

from typing import Optionalfrom typing import Optional





def setup_logging(level: Optional[str] = None):def setup_logging(level: str = "INFO", log_file: Optional[str] = None) -> None:

    """Setup logging configuration for Wingy.    """Configure logging for the application.

        

    Args:    Args:

        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

               Defaults to INFO if not specified        log_file: Optional file path to write logs to

    """    """

    if level is None:    # Create formatter

        level = "INFO"    formatter = logging.Formatter(

            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",

    # Convert string level to logging constant        datefmt="%Y-%m-%d %H:%M:%S",

    numeric_level = getattr(logging, level.upper(), logging.INFO)    )

        

    # Configure logging format    # Setup console handler

    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"    console_handler = logging.StreamHandler(sys.stdout)

    date_format = "%Y-%m-%d %H:%M:%S"    console_handler.setFormatter(formatter)

        

    # Configure root logger    handlers = [console_handler]

    logging.basicConfig(    

        level=numeric_level,    # Setup file handler if specified

        format=log_format,    if log_file:

        datefmt=date_format,        file_handler = logging.FileHandler(log_file)

        handlers=[        file_handler.setFormatter(formatter)

            logging.StreamHandler(sys.stdout),        handlers.append(file_handler)

        ],    

    )    # Configure root logger

        logging.basicConfig(

    # Set specific log levels for noisy libraries        level=getattr(logging, level.upper()),

    logging.getLogger("httpx").setLevel(logging.WARNING)        handlers=handlers,

    logging.getLogger("httpcore").setLevel(logging.WARNING)        force=True,

        )

    logger = logging.getLogger(__name__)    

    logger.info(f"Logging configured at {level} level")    # Set third-party loggers to WARNING to reduce noise

    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
